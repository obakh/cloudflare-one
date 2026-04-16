/**
 * Zaraz Consent Management
 *
 * Utilities for working with Zaraz's built-in consent management.
 * Zaraz handles consent at the edge - this provides React hooks and helpers.
 *
 * @see https://developers.cloudflare.com/zaraz/consent-management/
 */

import * as React from "react";

/**
 * Consent purpose (configured in Zaraz dashboard)
 * These are the default purposes - you can customize in the dashboard
 */
export const CONSENT_PURPOSES = {
	/** Essential cookies/tools - always enabled */
	NECESSARY: "necessary",
	/** Analytics and performance tracking */
	ANALYTICS: "analytics",
	/** Marketing and advertising */
	MARKETING: "marketing",
	/** Personalization and preferences */
	PERSONALIZATION: "personalization",
} as const;

export type ConsentPurpose = (typeof CONSENT_PURPOSES)[keyof typeof CONSENT_PURPOSES];

/**
 * Check if Zaraz consent API is available
 */
function isZarazConsentAvailable(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof window.zaraz !== "undefined" &&
		typeof window.zaraz.consent !== "undefined"
	);
}

/**
 * Get consent status for a purpose
 *
 * @example
 * ```ts
 * import { getConsent, CONSENT_PURPOSES } from "@repo/analytics/consent";
 *
 * if (getConsent(CONSENT_PURPOSES.ANALYTICS)) {
 *   // User has consented to analytics
 * }
 * ```
 */
export function getConsent(purpose: string): boolean {
	if (!isZarazConsentAvailable()) {
		return false;
	}
	return window.zaraz.consent?.get(purpose) ?? false;
}

/**
 * Set consent for a purpose
 *
 * @example
 * ```ts
 * import { setConsent, CONSENT_PURPOSES } from "@repo/analytics/consent";
 *
 * // Grant analytics consent
 * setConsent(CONSENT_PURPOSES.ANALYTICS, true);
 *
 * // Revoke marketing consent
 * setConsent(CONSENT_PURPOSES.MARKETING, false);
 * ```
 */
export function setConsent(purpose: string, granted: boolean): void {
	if (!isZarazConsentAvailable()) {
		return;
	}
	window.zaraz.consent?.set(purpose, granted);
}

/**
 * Get all consent statuses
 *
 * @example
 * ```ts
 * import { getAllConsent } from "@repo/analytics/consent";
 *
 * const consents = getAllConsent();
 * // { analytics: true, marketing: false, ... }
 * ```
 */
export function getAllConsent(): Record<string, boolean> {
	if (!isZarazConsentAvailable()) {
		return {};
	}
	return window.zaraz.consent?.getAll() ?? {};
}

/**
 * Set multiple consents at once
 *
 * @example
 * ```ts
 * import { setAllConsent, CONSENT_PURPOSES } from "@repo/analytics/consent";
 *
 * // Accept all
 * setAllConsent({
 *   [CONSENT_PURPOSES.ANALYTICS]: true,
 *   [CONSENT_PURPOSES.MARKETING]: true,
 *   [CONSENT_PURPOSES.PERSONALIZATION]: true,
 * });
 * ```
 */
export function setAllConsent(consents: Record<string, boolean>): void {
	if (!isZarazConsentAvailable()) {
		return;
	}
	window.zaraz.consent?.setAll(consents);
}

/**
 * Check if consent modal has been shown/decided
 */
export function hasConsentDecision(): boolean {
	if (!isZarazConsentAvailable()) {
		return false;
	}
	return window.zaraz.consent?.hasDecision?.() ?? false;
}

// React hooks

/**
 * Consent context for React
 */
interface ConsentContextValue {
	consents: Record<string, boolean>;
	hasDecided: boolean;
	setConsent: (purpose: string, granted: boolean) => void;
	acceptAll: () => void;
	rejectAll: () => void;
}

const ConsentContext = React.createContext<ConsentContextValue | null>(null);

/**
 * Consent Provider props
 */
export interface ConsentProviderProps {
	children: React.ReactNode;
	/** Purposes to manage (defaults to all standard purposes) */
	purposes?: string[];
	/** Callback when consent changes */
	onConsentChange?: (consents: Record<string, boolean>) => void;
}

/**
 * Consent Provider for React apps
 *
 * @example
 * ```tsx
 * import { ConsentProvider } from "@repo/analytics/consent";
 *
 * function App() {
 *   return (
 *     <ConsentProvider onConsentChange={(c) => console.log("Consent:", c)}>
 *       <MyApp />
 *     </ConsentProvider>
 *   );
 * }
 * ```
 */
export function ConsentProvider({
	children,
	purposes = Object.values(CONSENT_PURPOSES),
	onConsentChange,
}: ConsentProviderProps) {
	const [consents, setConsents] = React.useState<Record<string, boolean>>({});
	const [hasDecided, setHasDecided] = React.useState(false);

	// Sync with Zaraz on mount
	React.useEffect(() => {
		if (isZarazConsentAvailable()) {
			setConsents(getAllConsent());
			setHasDecided(hasConsentDecision());
		}
	}, []);

	const handleSetConsent = React.useCallback(
		(purpose: string, granted: boolean) => {
			setConsent(purpose, granted);
			const newConsents = { ...consents, [purpose]: granted };
			setConsents(newConsents);
			setHasDecided(true);
			onConsentChange?.(newConsents);
		},
		[consents, onConsentChange],
	);

	const acceptAll = React.useCallback(() => {
		const allGranted = purposes.reduce(
			(acc, p) => ({ ...acc, [p]: true }),
			{} as Record<string, boolean>,
		);
		setAllConsent(allGranted);
		setConsents(allGranted);
		setHasDecided(true);
		onConsentChange?.(allGranted);
	}, [purposes, onConsentChange]);

	const rejectAll = React.useCallback(() => {
		const allRejected = purposes.reduce(
			(acc, p) => ({
				...acc,
				[p]: p === CONSENT_PURPOSES.NECESSARY, // Keep necessary
			}),
			{} as Record<string, boolean>,
		);
		setAllConsent(allRejected);
		setConsents(allRejected);
		setHasDecided(true);
		onConsentChange?.(allRejected);
	}, [purposes, onConsentChange]);

	const value = React.useMemo(
		() => ({
			consents,
			hasDecided,
			setConsent: handleSetConsent,
			acceptAll,
			rejectAll,
		}),
		[consents, hasDecided, handleSetConsent, acceptAll, rejectAll],
	);

	return React.createElement(ConsentContext.Provider, { value }, children);
}

/**
 * Hook to access consent state and actions
 *
 * @example
 * ```tsx
 * import { useConsent, CONSENT_PURPOSES } from "@repo/analytics/consent";
 *
 * function ConsentBanner() {
 *   const { hasDecided, acceptAll, rejectAll } = useConsent();
 *
 *   if (hasDecided) return null;
 *
 *   return (
 *     <div className="consent-banner">
 *       <p>We use cookies to improve your experience.</p>
 *       <button onClick={acceptAll}>Accept All</button>
 *       <button onClick={rejectAll}>Reject All</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useConsent(): ConsentContextValue {
	const context = React.useContext(ConsentContext);
	if (!context) {
		throw new Error("useConsent must be used within a ConsentProvider");
	}
	return context;
}

/**
 * Hook to check consent for a specific purpose
 *
 * @example
 * ```tsx
 * import { useConsentPurpose, CONSENT_PURPOSES } from "@repo/analytics/consent";
 *
 * function AnalyticsLoader() {
 *   const hasAnalytics = useConsentPurpose(CONSENT_PURPOSES.ANALYTICS);
 *
 *   if (!hasAnalytics) {
 *     return null;
 *   }
 *
 *   return <SomeAnalyticsComponent />;
 * }
 * ```
 */
export function useConsentPurpose(purpose: string): boolean {
	const { consents } = useConsent();
	return consents[purpose] ?? false;
}

// Zaraz types are defined in client/index.ts
