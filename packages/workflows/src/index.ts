/**
 * @repo/workflows - Cloudflare Workflows utilities
 *
 * Helpers for building durable, multi-step workflows with automatic retries,
 * state persistence, and long-running execution.
 *
 * @example Basic workflow
 * ```ts
 * import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
 * import { withRetry, createWorkflowHelpers } from "@repo/workflows";
 *
 * export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
 *   async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
 *     const helpers = createWorkflowHelpers(step);
 *
 *     const data = await helpers.fetchJson("fetch-data", "https://api.example.com/data");
 *     await helpers.sleep("wait", "5 minutes");
 *     await helpers.retry("send-email", () => sendEmail(data), { limit: 3 });
 *   }
 * }
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface RetryOptions {
	/** Maximum retry attempts (default: 3) */
	limit?: number;
	/** Initial delay between retries (default: "1 second") */
	delay?: Duration;
	/** Backoff strategy (default: "exponential") */
	backoff?: "constant" | "linear" | "exponential";
	/** Maximum timeout for the step (default: "15 minutes") */
	timeout?: Duration;
}

export type Duration =
	| `${number} second`
	| `${number} seconds`
	| `${number} minute`
	| `${number} minutes`
	| `${number} hour`
	| `${number} hours`
	| `${number} day`
	| `${number} days`;

export interface StepOptions {
	retries?: {
		limit: number;
		delay: Duration;
		backoff: "constant" | "linear" | "exponential";
	};
	timeout?: Duration;
}

// ============================================================================
// Step Helpers
// ============================================================================

/**
 * Create workflow helper functions with common patterns
 *
 * @example
 * ```ts
 * const helpers = createWorkflowHelpers(step);
 *
 * // Fetch JSON with automatic parsing
 * const data = await helpers.fetchJson("get-users", "https://api.example.com/users");
 *
 * // Sleep for a duration
 * await helpers.sleep("wait-for-processing", "5 minutes");
 *
 * // Retry with exponential backoff
 * await helpers.retry("send-notification", () => sendPush(userId), { limit: 5 });
 *
 * // Run steps in parallel
 * const [users, posts] = await helpers.parallel([
 *   ["fetch-users", () => fetchUsers()],
 *   ["fetch-posts", () => fetchPosts()],
 * ]);
 * ```
 */
export function createWorkflowHelpers(step: WorkflowStep) {
	return {
		/**
		 * Fetch JSON from a URL
		 */
		async fetchJson<T>(name: string, url: string, init?: RequestInit): Promise<T> {
			return step.do(name, async () => {
				const response = await fetch(url, init);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
				return response.json() as Promise<T>;
			});
		},

		/**
		 * Fetch text from a URL
		 */
		async fetchText(name: string, url: string, init?: RequestInit): Promise<string> {
			return step.do(name, async () => {
				const response = await fetch(url, init);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
				return response.text();
			});
		},

		/**
		 * Sleep for a duration
		 */
		async sleep(name: string, duration: Duration): Promise<void> {
			return step.sleep(name, duration);
		},

		/**
		 * Execute a step with retry options
		 */
		async retry<T>(name: string, fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
			const {
				limit = 3,
				delay = "1 second",
				backoff = "exponential",
				timeout = "15 minutes",
			} = options;

			return step.do(
				name,
				{
					retries: { limit, delay, backoff },
					timeout,
				},
				fn,
			);
		},

		/**
		 * Execute multiple steps in parallel
		 */
		async parallel<T extends readonly unknown[]>(
			steps: { [K in keyof T]: [string, () => Promise<T[K]>] },
		): Promise<T> {
			const results = await Promise.all(steps.map(([name, fn]) => step.do(name, fn)));
			return results as unknown as T;
		},

		/**
		 * Execute a step that may fail without stopping the workflow
		 */
		async tryStep<T>(name: string, fn: () => Promise<T>, fallback: T): Promise<T> {
			try {
				return await step.do(name, fn);
			} catch {
				return fallback;
			}
		},

		/**
		 * Execute a conditional step
		 */
		async when<T>(condition: boolean, name: string, fn: () => Promise<T>): Promise<T | undefined> {
			if (!condition) return undefined;
			return step.do(name, fn);
		},

		/**
		 * Execute steps sequentially with results
		 */
		async sequence<T>(
			steps: Array<[string, (prev: T | undefined) => Promise<T>]>,
			initial?: T,
		): Promise<T | undefined> {
			let result: T | undefined = initial;
			for (const [name, fn] of steps) {
				result = await step.do(name, () => fn(result));
			}
			return result;
		},
	};
}

// ============================================================================
// Workflow Instance Helpers
// ============================================================================

/**
 * Create a workflow instance with a unique ID
 */
export async function createWorkflowInstance<P = unknown>(
	workflow: Workflow,
	params?: P,
	id?: string,
): Promise<WorkflowInstance> {
	const instanceId = id ?? crypto.randomUUID();
	return workflow.create({ id: instanceId, params });
}

/**
 * Get workflow instance status
 */
export async function getWorkflowStatus(
	workflow: Workflow,
	instanceId: string,
): Promise<WorkflowInstanceStatus> {
	const instance = await workflow.get(instanceId);
	return instance.status();
}

/**
 * Wait for a workflow to complete
 */
export async function waitForWorkflow(
	workflow: Workflow,
	instanceId: string,
	options: {
		pollInterval?: number;
		timeout?: number;
	} = {},
): Promise<WorkflowInstanceStatus> {
	const { pollInterval = 1000, timeout = 300000 } = options;
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		const status = await getWorkflowStatus(workflow, instanceId);

		if (
			status.status === "complete" ||
			status.status === "errored" ||
			status.status === "terminated"
		) {
			return status;
		}

		await new Promise((resolve) => setTimeout(resolve, pollInterval));
	}

	throw new Error(`Workflow ${instanceId} timed out after ${timeout}ms`);
}

// ============================================================================
// Common Workflow Patterns
// ============================================================================

/**
 * Retry configuration presets
 */
export const RetryPresets = {
	/** Quick retries for transient failures */
	fast: {
		limit: 3,
		delay: "1 second" as Duration,
		backoff: "exponential" as const,
		timeout: "1 minute" as Duration,
	},
	/** Standard retry for API calls */
	standard: {
		limit: 5,
		delay: "5 seconds" as Duration,
		backoff: "exponential" as const,
		timeout: "15 minutes" as Duration,
	},
	/** Patient retry for rate-limited APIs */
	patient: {
		limit: 10,
		delay: "30 seconds" as Duration,
		backoff: "linear" as const,
		timeout: "1 hour" as Duration,
	},
	/** Aggressive retry for critical operations */
	aggressive: {
		limit: 20,
		delay: "1 second" as Duration,
		backoff: "exponential" as const,
		timeout: "30 minutes" as Duration,
	},
} as const;

/**
 * Common sleep durations
 */
export const SleepDurations = {
	brief: "10 seconds" as Duration,
	short: "1 minute" as Duration,
	medium: "5 minutes" as Duration,
	long: "30 minutes" as Duration,
	hour: "1 hour" as Duration,
	day: "1 day" as Duration,
} as const;

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Extract params type from a workflow
 */
export type WorkflowParams<W> = W extends WorkflowEntrypoint<unknown, infer P> ? P : never;

/**
 * Extract env type from a workflow
 */
export type WorkflowEnv<W> = W extends WorkflowEntrypoint<infer E, unknown> ? E : never;

// ============================================================================
// Workflow Step Interface (for type reference)
// ============================================================================

/**
 * WorkflowStep interface from cloudflare:workers
 * Included here for reference - use the actual import in your code
 */
export interface WorkflowStep {
	do<T>(name: string, callback: () => Promise<T>): Promise<T>;
	do<T>(name: string, config: StepOptions, callback: () => Promise<T>): Promise<T>;
	sleep(name: string, duration: Duration): Promise<void>;
	sleepUntil(name: string, timestamp: Date | number): Promise<void>;
}

/**
 * WorkflowEvent interface from cloudflare:workers
 */
export interface WorkflowEvent<P = unknown> {
	payload: P;
	timestamp: Date;
	instanceId: string;
}

/**
 * WorkflowEntrypoint base class
 */
export interface WorkflowEntrypoint<E = unknown, P = unknown> {
	run(event: WorkflowEvent<P>, step: WorkflowStep): Promise<unknown>;
	env: E;
}

/**
 * Workflow binding interface
 */
export interface Workflow<P = unknown> {
	create(options?: { id?: string; params?: P }): Promise<WorkflowInstance>;
	get(id: string): Promise<WorkflowInstance>;
}

/**
 * Workflow instance interface
 */
export interface WorkflowInstance {
	id: string;
	status(): Promise<WorkflowInstanceStatus>;
	pause(): Promise<void>;
	resume(): Promise<void>;
	terminate(): Promise<void>;
	restart(): Promise<void>;
}

/**
 * Workflow instance status
 */
export interface WorkflowInstanceStatus {
	status: "queued" | "running" | "paused" | "complete" | "errored" | "terminated" | "waiting";
	error?: string;
	output?: unknown;
}
