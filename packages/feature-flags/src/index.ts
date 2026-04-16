/**
 * @repo/feature-flags - Feature Flag Management
 *
 * Simple, type-safe feature flags for Cloudflare Workers.
 * Supports boolean flags, percentage rollouts, and user targeting.
 *
 * @example
 * ```ts
 * import { createFeatureFlags } from "@repo/feature-flags";
 *
 * const flags = createFeatureFlags(env.KV, {
 *   "new-checkout": true,
 *   "dark-mode": { enabled: true, rollout: 50 },
 *   "beta-features": { enabled: true, allowlist: ["user:123"] },
 * });
 *
 * if (await flags.isEnabled("new-checkout")) {
 *   // Show new checkout
 * }
 * ```
 */

import * as React from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * Simple flag (just enabled/disabled)
 */
export type SimpleFlag = boolean;

/**
 * Flag with rollout percentage
 */
export interface RolloutFlag {
	enabled: boolean;
	/** Percentage of users to enable (0-100) */
	rollout?: number;
}

/**
 * Flag with user targeting
 */
export interface TargetedFlag {
	enabled: boolean;
	/** Percentage rollout (0-100) */
	rollout?: number;
	/** Users who always get the flag enabled */
	allowlist?: string[];
	/** Users who always get the flag disabled */
	blocklist?: string[];
}

/**
 * Flag definition
 */
export type FlagDefinition = SimpleFlag | RolloutFlag | TargetedFlag;

/**
 * Flag configuration map
 */
export type FlagConfig = Record<string, FlagDefinition>;

/**
 * Evaluation context for targeting
 */
export interface EvaluationContext {
	/** User identifier for consistent bucketing */
	userId?: string;
	/** Additional attributes for targeting */
	[key: string]: string | number | boolean | undefined;
}

/**
 * Flag evaluation result with metadata
 */
export interface FlagEvaluation {
	enabled: boolean;
	reason: "default" | "rollout" | "allowlist" | "blocklist" | "disabled";
}

// ============================================================================
// Core Implementation
// ============================================================================

/**
 * Create a feature flags client
 *
 * @example
 * ```ts
 * // Static config (in code)
 * const flags = createFeatureFlags(env.KV, {
 *   "new-checkout": true,
 *   "dark-mode": { enabled: true, rollout: 50 },
 * });
 *
 * // Check flag
 * if (await flags.isEnabled("new-checkout")) {
 *   // Feature is enabled
 * }
 *
 * // Check with user context (for rollouts)
 * if (await flags.isEnabled("dark-mode", { userId: "user:123" })) {
 *   // User is in the rollout
 * }
 * ```
 */
export function createFeatureFlags<T extends FlagConfig>(kv: KVNamespace | null, defaultConfig: T) {
	type FlagKey = keyof T & string;

	/**
	 * Get flag definition (from KV override or default config)
	 */
	async function getFlagDefinition(key: FlagKey): Promise<FlagDefinition | undefined> {
		// Try KV override first
		if (kv) {
			try {
				const override = await kv.get<FlagDefinition>(`flag:${key}`, "json");
				if (override !== null) {
					return override;
				}
			} catch {
				// KV error, fall back to default
			}
		}

		return defaultConfig[key];
	}

	/**
	 * Evaluate a flag
	 */
	async function evaluate(key: FlagKey, context?: EvaluationContext): Promise<FlagEvaluation> {
		const definition = await getFlagDefinition(key);

		if (definition === undefined) {
			return { enabled: false, reason: "default" };
		}

		// Simple boolean flag
		if (typeof definition === "boolean") {
			return { enabled: definition, reason: "default" };
		}

		// Flag is disabled
		if (!definition.enabled) {
			return { enabled: false, reason: "disabled" };
		}

		const userId = context?.userId;

		// Check blocklist
		if ("blocklist" in definition && definition.blocklist && userId) {
			if (definition.blocklist.includes(userId)) {
				return { enabled: false, reason: "blocklist" };
			}
		}

		// Check allowlist
		if ("allowlist" in definition && definition.allowlist && userId) {
			if (definition.allowlist.includes(userId)) {
				return { enabled: true, reason: "allowlist" };
			}
		}

		// Check rollout percentage
		if (definition.rollout !== undefined && definition.rollout < 100) {
			if (!userId) {
				// No user ID, use random (not recommended for consistency)
				const random = Math.random() * 100;
				return {
					enabled: random < definition.rollout,
					reason: "rollout",
				};
			}

			// Consistent bucketing based on user ID
			const bucket = hashToBucket(userId, key);
			return {
				enabled: bucket < definition.rollout,
				reason: "rollout",
			};
		}

		// Flag is enabled with no rollout restrictions
		return { enabled: true, reason: "default" };
	}

	/**
	 * Check if a flag is enabled
	 */
	async function isEnabled(key: FlagKey, context?: EvaluationContext): Promise<boolean> {
		const result = await evaluate(key, context);
		return result.enabled;
	}

	/**
	 * Get all flags for a context (useful for client-side hydration)
	 */
	async function getAllFlags(context?: EvaluationContext): Promise<Record<FlagKey, boolean>> {
		const keys = Object.keys(defaultConfig) as FlagKey[];
		const results = await Promise.all(
			keys.map(async (key) => ({
				key,
				enabled: await isEnabled(key, context),
			})),
		);

		return Object.fromEntries(results.map(({ key, enabled }) => [key, enabled])) as Record<
			FlagKey,
			boolean
		>;
	}

	/**
	 * Override a flag in KV (for runtime changes)
	 */
	async function setOverride(key: FlagKey, definition: FlagDefinition): Promise<void> {
		if (!kv) {
			throw new Error("KV namespace required for overrides");
		}
		await kv.put(`flag:${key}`, JSON.stringify(definition));
	}

	/**
	 * Remove a flag override from KV
	 */
	async function removeOverride(key: FlagKey): Promise<void> {
		if (!kv) {
			throw new Error("KV namespace required for overrides");
		}
		await kv.delete(`flag:${key}`);
	}

	return {
		isEnabled,
		evaluate,
		getAllFlags,
		setOverride,
		removeOverride,
	};
}

/**
 * Hash a string to a bucket (0-100) for consistent rollouts
 */
function hashToBucket(userId: string, flagKey: string): number {
	const str = `${flagKey}:${userId}`;
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Convert to 0-100 range
	return Math.abs(hash) % 100;
}

// ============================================================================
// Hono Middleware
// ============================================================================

/**
 * Create Hono middleware that adds feature flags to context
 *
 * @example
 * ```ts
 * import { Hono } from "hono";
 * import { createFlagsMiddleware } from "@repo/feature-flags";
 *
 * const app = new Hono<{ Variables: { flags: Record<string, boolean> } }>();
 *
 * app.use("*", createFlagsMiddleware({
 *   kv: (env) => env.KV,
 *   config: {
 *     "new-checkout": true,
 *     "dark-mode": { enabled: true, rollout: 50 },
 *   },
 *   getUserId: (c) => c.get("userId"),
 * }));
 *
 * app.get("/", (c) => {
 *   const flags = c.get("flags");
 *   return c.json({ darkMode: flags["dark-mode"] });
 * });
 * ```
 */
export function createFlagsMiddleware<T extends FlagConfig>(options: {
	kv?: (env: unknown) => KVNamespace | null;
	config: T;
	getUserId?: (c: unknown) => string | undefined;
}) {
	const { kv: getKV, config, getUserId } = options;

	return async (
		c: { env: unknown; set: (key: string, value: unknown) => void },
		next: () => Promise<void>,
	) => {
		const kvNamespace = getKV?.(c.env) ?? null;
		const flags = createFeatureFlags(kvNamespace, config);

		const userId = getUserId?.(c);
		const context: EvaluationContext = userId ? { userId } : {};

		const allFlags = await flags.getAllFlags(context);
		c.set("flags", allFlags);

		await next();
	};
}

// ============================================================================
// React Integration
// ============================================================================

/**
 * Feature flags context
 */
interface FeatureFlagsContextValue {
	flags: Record<string, boolean>;
	isEnabled: (key: string) => boolean;
}

const FeatureFlagsContext = React.createContext<FeatureFlagsContextValue | null>(null);

/**
 * Feature flags provider props
 */
export interface FeatureFlagsProviderProps {
	children: React.ReactNode;
	/** Pre-evaluated flags (from server) */
	flags: Record<string, boolean>;
}

/**
 * Feature flags provider for React
 *
 * @example
 * ```tsx
 * // Server: evaluate flags and pass to client
 * const flags = await featureFlags.getAllFlags({ userId });
 *
 * // Client
 * import { FeatureFlagsProvider, useFeatureFlag } from "@repo/feature-flags";
 *
 * function App() {
 *   return (
 *     <FeatureFlagsProvider flags={serverFlags}>
 *       <MyApp />
 *     </FeatureFlagsProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const isDarkMode = useFeatureFlag("dark-mode");
 *   return isDarkMode ? <DarkTheme /> : <LightTheme />;
 * }
 * ```
 */
export function FeatureFlagsProvider({ children, flags }: FeatureFlagsProviderProps) {
	const value = React.useMemo(
		() => ({
			flags,
			isEnabled: (key: string) => flags[key] ?? false,
		}),
		[flags],
	);

	return React.createElement(FeatureFlagsContext.Provider, { value }, children);
}

/**
 * Hook to check if a feature flag is enabled
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isNewCheckout = useFeatureFlag("new-checkout");
 *
 *   if (isNewCheckout) {
 *     return <NewCheckout />;
 *   }
 *   return <OldCheckout />;
 * }
 * ```
 */
export function useFeatureFlag(key: string): boolean {
	const context = React.useContext(FeatureFlagsContext);
	if (!context) {
		throw new Error("useFeatureFlag must be used within a FeatureFlagsProvider");
	}
	return context.isEnabled(key);
}

/**
 * Hook to get all feature flags
 *
 * @example
 * ```tsx
 * function DebugPanel() {
 *   const flags = useFeatureFlags();
 *   return <pre>{JSON.stringify(flags, null, 2)}</pre>;
 * }
 * ```
 */
export function useFeatureFlags(): Record<string, boolean> {
	const context = React.useContext(FeatureFlagsContext);
	if (!context) {
		throw new Error("useFeatureFlags must be used within a FeatureFlagsProvider");
	}
	return context.flags;
}

/**
 * Component that renders children only if flag is enabled
 *
 * @example
 * ```tsx
 * <Feature flag="new-checkout">
 *   <NewCheckoutFlow />
 * </Feature>
 *
 * <Feature flag="beta-features" fallback={<ComingSoon />}>
 *   <BetaFeature />
 * </Feature>
 * ```
 */
export function Feature({
	flag,
	children,
	fallback = null,
}: {
	flag: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	const isEnabled = useFeatureFlag(flag);
	return React.createElement(React.Fragment, null, isEnabled ? children : fallback);
}
