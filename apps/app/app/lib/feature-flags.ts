/**
 * Feature flags configuration
 * Uses @repo/feature-flags for type-safe feature management
 */
import {
	createFeatureFlags,
	Feature,
	FeatureFlagsProvider,
	type FlagConfig,
	useFeatureFlag,
	useFeatureFlags,
} from "@repo/feature-flags";

// Re-export React components
export { FeatureFlagsProvider, useFeatureFlag, useFeatureFlags, Feature };

/**
 * App feature flags configuration
 * Add new flags here as needed
 */
export const flagsConfig = {
	// UI Features
	"dark-mode": true,
	"new-sidebar": { enabled: true, rollout: 100 },
	"command-palette": true,

	// Product Features
	"vault-enabled": true,
	"insights-enabled": true,
	"team-invites": true,

	// Beta Features
	"ai-assistant": { enabled: true, rollout: 10 },
	"advanced-analytics": { enabled: false },

	// Experiments
	"new-onboarding": { enabled: true, rollout: 50 },
} satisfies FlagConfig;

export type AppFlags = typeof flagsConfig;
export type AppFlagKey = keyof AppFlags;

/**
 * Create feature flags client for server-side evaluation
 */
export function createAppFlags(kv: KVNamespace | null) {
	return createFeatureFlags(kv, flagsConfig);
}
