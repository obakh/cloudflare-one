/**
 * @repo/experiments - A/B Testing & Experimentation
 *
 * Run experiments with consistent user bucketing at the edge.
 * Supports A/B tests, multivariate tests, and percentage rollouts.
 *
 * @example
 * ```ts
 * import { createExperiments, getVariant } from "@repo/experiments";
 *
 * const experiments = createExperiments({
 *   "checkout-flow": {
 *     variants: [
 *       { id: "control", weight: 50 },
 *       { id: "new-checkout", weight: 50 },
 *     ],
 *   },
 * });
 *
 * const variant = experiments.getVariant("checkout-flow", { userId: "user:123" });
 * // "control" or "new-checkout" (consistent for same user)
 * ```
 */

import * as React from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * Experiment variant
 */
export interface Variant {
	/** Unique variant identifier */
	id: string;
	/** Weight for random assignment (relative to other variants) */
	weight: number;
}

/**
 * Experiment definition
 */
export interface Experiment {
	/** Experiment variants */
	variants: Variant[];
	/** Whether experiment is active */
	active?: boolean;
	/** User allowlist (always gets first variant) */
	allowlist?: string[];
	/** User blocklist (always gets control/first variant) */
	blocklist?: string[];
}

/**
 * Experiment configuration map
 */
export type ExperimentConfig = Record<string, Experiment>;

/**
 * Evaluation context
 */
export interface ExperimentContext {
	/** User identifier for consistent bucketing */
	userId: string;
	/** Additional attributes */
	[key: string]: string | number | boolean | undefined;
}

/**
 * Experiment assignment result
 */
export interface Assignment {
	experimentId: string;
	variantId: string;
	reason: "bucketed" | "allowlist" | "blocklist" | "inactive" | "default";
}

// ============================================================================
// Core Implementation
// ============================================================================

/**
 * Create an experiments client
 *
 * @example
 * ```ts
 * const experiments = createExperiments({
 *   "checkout-flow": {
 *     variants: [
 *       { id: "control", weight: 50 },
 *       { id: "new-checkout", weight: 50 },
 *     ],
 *   },
 *   "pricing-page": {
 *     variants: [
 *       { id: "control", weight: 34 },
 *       { id: "variant-a", weight: 33 },
 *       { id: "variant-b", weight: 33 },
 *     ],
 *   },
 * });
 *
 * const variant = experiments.getVariant("checkout-flow", { userId: "user:123" });
 * ```
 */
export function createExperiments<T extends ExperimentConfig>(config: T) {
	type ExperimentKey = keyof T & string;

	/**
	 * Get variant assignment for an experiment
	 */
	function assign(experimentId: ExperimentKey, context: ExperimentContext): Assignment {
		const experiment = config[experimentId];

		if (!experiment) {
			return {
				experimentId,
				variantId: "control",
				reason: "default",
			};
		}

		// Check if experiment is active
		if (experiment.active === false) {
			return {
				experimentId,
				variantId: experiment.variants[0]?.id ?? "control",
				reason: "inactive",
			};
		}

		const { userId } = context;

		// Check blocklist (gets control)
		if (experiment.blocklist?.includes(userId)) {
			return {
				experimentId,
				variantId: experiment.variants[0]?.id ?? "control",
				reason: "blocklist",
			};
		}

		// Check allowlist (gets first non-control variant or second variant)
		if (experiment.allowlist?.includes(userId)) {
			const variant = experiment.variants[1] ?? experiment.variants[0];
			return {
				experimentId,
				variantId: variant?.id ?? "control",
				reason: "allowlist",
			};
		}

		// Bucket user into variant
		const variantId = bucketToVariant(userId, experimentId, experiment.variants);

		return {
			experimentId,
			variantId,
			reason: "bucketed",
		};
	}

	/**
	 * Get variant ID for an experiment
	 */
	function getVariant(experimentId: ExperimentKey, context: ExperimentContext): string {
		return assign(experimentId, context).variantId;
	}

	/**
	 * Check if user is in a specific variant
	 */
	function isVariant(
		experimentId: ExperimentKey,
		variantId: string,
		context: ExperimentContext,
	): boolean {
		return getVariant(experimentId, context) === variantId;
	}

	/**
	 * Get all experiment assignments for a user
	 */
	function getAllAssignments(context: ExperimentContext): Record<ExperimentKey, string> {
		const keys = Object.keys(config) as ExperimentKey[];
		return Object.fromEntries(keys.map((key) => [key, getVariant(key, context)])) as Record<
			ExperimentKey,
			string
		>;
	}

	return {
		assign,
		getVariant,
		isVariant,
		getAllAssignments,
		config,
	};
}

/**
 * Bucket a user into a variant based on weights
 */
function bucketToVariant(userId: string, experimentId: string, variants: Variant[]): string {
	if (variants.length === 0) {
		return "control";
	}

	if (variants.length === 1) {
		return variants[0].id;
	}

	// Calculate total weight
	const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);

	// Get bucket (0 to totalWeight)
	const bucket = hashToBucket(userId, experimentId, totalWeight);

	// Find variant for bucket
	let cumulative = 0;
	for (const variant of variants) {
		cumulative += variant.weight;
		if (bucket < cumulative) {
			return variant.id;
		}
	}

	// Fallback to last variant
	return variants[variants.length - 1].id;
}

/**
 * Hash user ID and experiment to a bucket
 */
function hashToBucket(userId: string, experimentId: string, max: number): number {
	const str = `${experimentId}:${userId}`;
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}

	return Math.abs(hash) % max;
}

// ============================================================================
// Cookie-based A/B Testing (Edge)
// ============================================================================

/**
 * Cookie-based experiment assignment for edge workers
 *
 * @example
 * ```ts
 * import { getOrAssignVariant } from "@repo/experiments";
 *
 * export default {
 *   async fetch(request) {
 *     const { variant, cookie } = getOrAssignVariant(request, {
 *       experimentId: "checkout-flow",
 *       variants: ["control", "new-checkout"],
 *       cookieName: "exp_checkout",
 *     });
 *
 *     // Route based on variant
 *     const url = new URL(request.url);
 *     if (variant === "new-checkout") {
 *       url.pathname = "/new" + url.pathname;
 *     }
 *
 *     const response = await fetch(url);
 *
 *     // Set cookie if new assignment
 *     if (cookie) {
 *       const res = new Response(response.body, response);
 *       res.headers.append("Set-Cookie", cookie);
 *       return res;
 *     }
 *
 *     return response;
 *   },
 * };
 * ```
 */
export function getOrAssignVariant(
	request: Request,
	options: {
		experimentId: string;
		variants: string[];
		weights?: number[];
		cookieName?: string;
		cookieMaxAge?: number;
	},
): { variant: string; cookie: string | null; isNew: boolean } {
	const {
		experimentId,
		variants,
		weights,
		cookieName = `exp_${experimentId}`,
		cookieMaxAge = 30 * 24 * 60 * 60, // 30 days
	} = options;

	// Check for existing cookie
	const cookieHeader = request.headers.get("cookie") ?? "";
	const existingVariant = parseCookie(cookieHeader, cookieName);

	if (existingVariant && variants.includes(existingVariant)) {
		return { variant: existingVariant, cookie: null, isNew: false };
	}

	// Assign new variant
	let variant: string;

	if (weights && weights.length === variants.length) {
		// Weighted assignment
		const totalWeight = weights.reduce((a, b) => a + b, 0);
		const random = Math.random() * totalWeight;
		let cumulative = 0;
		variant = variants[variants.length - 1];

		for (let i = 0; i < variants.length; i++) {
			cumulative += weights[i];
			if (random < cumulative) {
				variant = variants[i];
				break;
			}
		}
	} else {
		// Equal weight assignment
		const index = Math.floor(Math.random() * variants.length);
		variant = variants[index];
	}

	// Create cookie
	const cookie = `${cookieName}=${variant}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax`;

	return { variant, cookie, isNew: true };
}

/**
 * Parse a cookie value from cookie header
 */
function parseCookie(cookieHeader: string, name: string): string | null {
	const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
	return match ? match[1] : null;
}

// ============================================================================
// Hono Middleware
// ============================================================================

/**
 * Create Hono middleware for experiments
 *
 * @example
 * ```ts
 * import { Hono } from "hono";
 * import { createExperimentsMiddleware } from "@repo/experiments";
 *
 * const app = new Hono();
 *
 * app.use("*", createExperimentsMiddleware({
 *   config: {
 *     "checkout-flow": {
 *       variants: [
 *         { id: "control", weight: 50 },
 *         { id: "new-checkout", weight: 50 },
 *       ],
 *     },
 *   },
 *   getUserId: (c) => c.get("userId") ?? c.req.header("x-user-id"),
 * }));
 *
 * app.get("/", (c) => {
 *   const experiments = c.get("experiments");
 *   return c.json({ variant: experiments["checkout-flow"] });
 * });
 * ```
 */
export function createExperimentsMiddleware<T extends ExperimentConfig>(options: {
	config: T;
	getUserId: (c: unknown) => string | undefined;
}) {
	const { config, getUserId } = options;
	const experiments = createExperiments(config);

	return async (
		c: {
			set: (key: string, value: unknown) => void;
			req: { header: (name: string) => string | undefined };
		},
		next: () => Promise<void>,
	) => {
		const userId = getUserId(c) ?? crypto.randomUUID();
		const assignments = experiments.getAllAssignments({ userId });

		c.set("experiments", assignments);
		c.set("experimentUserId", userId);

		await next();
	};
}

// ============================================================================
// React Integration
// ============================================================================

/**
 * Experiments context
 */
interface ExperimentsContextValue {
	assignments: Record<string, string>;
	getVariant: (experimentId: string) => string;
	isVariant: (experimentId: string, variantId: string) => boolean;
}

const ExperimentsContext = React.createContext<ExperimentsContextValue | null>(null);

/**
 * Experiments provider props
 */
export interface ExperimentsProviderProps {
	children: React.ReactNode;
	/** Pre-computed assignments from server */
	assignments: Record<string, string>;
}

/**
 * Experiments provider for React
 *
 * @example
 * ```tsx
 * // Server: compute assignments
 * const assignments = experiments.getAllAssignments({ userId });
 *
 * // Client
 * import { ExperimentsProvider, useExperiment } from "@repo/experiments";
 *
 * function App() {
 *   return (
 *     <ExperimentsProvider assignments={serverAssignments}>
 *       <MyApp />
 *     </ExperimentsProvider>
 *   );
 * }
 * ```
 */
export function ExperimentsProvider({ children, assignments }: ExperimentsProviderProps) {
	const value = React.useMemo(
		() => ({
			assignments,
			getVariant: (experimentId: string) => assignments[experimentId] ?? "control",
			isVariant: (experimentId: string, variantId: string) =>
				assignments[experimentId] === variantId,
		}),
		[assignments],
	);

	return React.createElement(ExperimentsContext.Provider, { value }, children);
}

/**
 * Hook to get variant for an experiment
 *
 * @example
 * ```tsx
 * function CheckoutPage() {
 *   const variant = useExperiment("checkout-flow");
 *
 *   if (variant === "new-checkout") {
 *     return <NewCheckout />;
 *   }
 *   return <OldCheckout />;
 * }
 * ```
 */
export function useExperiment(experimentId: string): string {
	const context = React.useContext(ExperimentsContext);
	if (!context) {
		throw new Error("useExperiment must be used within an ExperimentsProvider");
	}
	return context.getVariant(experimentId);
}

/**
 * Hook to check if user is in a specific variant
 *
 * @example
 * ```tsx
 * function PricingPage() {
 *   const isVariantA = useVariant("pricing-test", "variant-a");
 *   const isVariantB = useVariant("pricing-test", "variant-b");
 *
 *   if (isVariantA) return <PricingA />;
 *   if (isVariantB) return <PricingB />;
 *   return <PricingControl />;
 * }
 * ```
 */
export function useVariant(experimentId: string, variantId: string): boolean {
	const context = React.useContext(ExperimentsContext);
	if (!context) {
		throw new Error("useVariant must be used within an ExperimentsProvider");
	}
	return context.isVariant(experimentId, variantId);
}

/**
 * Hook to get all experiment assignments
 */
export function useExperiments(): Record<string, string> {
	const context = React.useContext(ExperimentsContext);
	if (!context) {
		throw new Error("useExperiments must be used within an ExperimentsProvider");
	}
	return context.assignments;
}

/**
 * Component that renders based on variant
 *
 * @example
 * ```tsx
 * <Experiment
 *   id="checkout-flow"
 *   variants={{
 *     control: <OldCheckout />,
 *     "new-checkout": <NewCheckout />,
 *   }}
 * />
 * ```
 */
export function Experiment({
	id,
	variants,
	fallback = null,
}: {
	id: string;
	variants: Record<string, React.ReactNode>;
	fallback?: React.ReactNode;
}) {
	const variant = useExperiment(id);
	const content = variants[variant] ?? variants.control ?? fallback;
	return React.createElement(React.Fragment, null, content);
}
