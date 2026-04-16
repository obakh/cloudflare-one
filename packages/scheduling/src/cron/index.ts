/**
 * Cron Trigger Helpers for Cloudflare Workers
 *
 * Utilities for working with scheduled cron jobs.
 *
 * @see https://developers.cloudflare.com/workers/configuration/cron-triggers/
 */

/**
 * Common cron patterns
 *
 * @example
 * ```jsonc
 * // wrangler.jsonc
 * {
 *   "triggers": {
 *     "crons": ["0 * * * *", "0 0 * * *"]
 *   }
 * }
 * ```
 */
export const CRON_PATTERNS = {
	/** Every minute */
	EVERY_MINUTE: "* * * * *",
	/** Every 5 minutes */
	EVERY_5_MINUTES: "*/5 * * * *",
	/** Every 15 minutes */
	EVERY_15_MINUTES: "*/15 * * * *",
	/** Every 30 minutes */
	EVERY_30_MINUTES: "*/30 * * * *",
	/** Every hour */
	EVERY_HOUR: "0 * * * *",
	/** Every 6 hours */
	EVERY_6_HOURS: "0 */6 * * *",
	/** Every 12 hours */
	EVERY_12_HOURS: "0 */12 * * *",
	/** Daily at midnight UTC */
	DAILY_MIDNIGHT: "0 0 * * *",
	/** Daily at noon UTC */
	DAILY_NOON: "0 12 * * *",
	/** Weekly on Sunday at midnight */
	WEEKLY_SUNDAY: "0 0 * * 0",
	/** Weekly on Monday at midnight */
	WEEKLY_MONDAY: "0 0 * * 1",
	/** Monthly on the 1st at midnight */
	MONTHLY_FIRST: "0 0 1 * *",
} as const;

/**
 * Cron job handler function type
 */
export type CronHandler<Env = unknown> = (env: Env, ctx: ExecutionContext) => Promise<void>;

/**
 * Cron job registry
 */
export type CronRegistry<Env = unknown> = {
	[pattern: string]: CronHandler<Env>;
};

/**
 * Create a cron job scheduler
 *
 * @example
 * ```ts
 * import { createCronScheduler, CRON_PATTERNS } from "@repo/scheduling/cron";
 *
 * const scheduler = createCronScheduler<Env>({
 *   [CRON_PATTERNS.EVERY_HOUR]: async (env) => {
 *     // Hourly job
 *     await syncData(env);
 *   },
 *   [CRON_PATTERNS.DAILY_MIDNIGHT]: async (env) => {
 *     // Daily cleanup
 *     await cleanupOldRecords(env);
 *   },
 * });
 *
 * export default {
 *   scheduled: scheduler.handle,
 * };
 * ```
 */
export function createCronScheduler<Env = unknown>(registry: CronRegistry<Env>) {
	return {
		/**
		 * Handle a scheduled event
		 */
		async handle(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
			const handler = registry[event.cron];

			if (handler) {
				console.log(`[Cron] Running job: ${event.cron}`);
				try {
					await handler(env, ctx);
					console.log(`[Cron] Completed: ${event.cron}`);
				} catch (error) {
					console.error(`[Cron] Failed: ${event.cron}`, error);
					throw error;
				}
			} else {
				console.warn(`[Cron] No handler for: ${event.cron}`);
			}
		},

		/**
		 * List registered cron patterns
		 */
		patterns(): string[] {
			return Object.keys(registry);
		},
	};
}

/**
 * Create a simple scheduled handler
 *
 * @example
 * ```ts
 * import { createScheduledHandler } from "@repo/scheduling/cron";
 *
 * export default {
 *   scheduled: createScheduledHandler(async (event, env, ctx) => {
 *     console.log(`Cron triggered: ${event.cron}`);
 *     await doWork(env);
 *   }),
 * };
 * ```
 */
export function createScheduledHandler<Env = unknown>(
	handler: (event: ScheduledController, env: Env, ctx: ExecutionContext) => Promise<void>,
) {
	return async (event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> => {
		console.log(
			`[Cron] Triggered: ${event.cron} at ${new Date(event.scheduledTime).toISOString()}`,
		);
		try {
			await handler(event, env, ctx);
		} catch (error) {
			console.error(`[Cron] Error:`, error);
			throw error;
		}
	};
}

/**
 * Run multiple jobs in parallel for a cron trigger
 *
 * @example
 * ```ts
 * import { runParallelJobs } from "@repo/scheduling/cron";
 *
 * const scheduler = createCronScheduler<Env>({
 *   [CRON_PATTERNS.EVERY_HOUR]: (env, ctx) => runParallelJobs([
 *     () => syncUsers(env),
 *     () => syncProducts(env),
 *     () => updateCache(env),
 *   ]),
 * });
 * ```
 */
export async function runParallelJobs(jobs: Array<() => Promise<void>>): Promise<void> {
	const results = await Promise.allSettled(jobs.map((job) => job()));

	const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");

	if (failures.length > 0) {
		console.error(`[Cron] ${failures.length}/${jobs.length} jobs failed`);
		failures.forEach((f, i) => console.error(`[Cron] Job ${i} error:`, f.reason));

		// Throw if all jobs failed
		if (failures.length === jobs.length) {
			throw new Error("All cron jobs failed");
		}
	}
}

/**
 * Run jobs sequentially (useful when order matters)
 */
export async function runSequentialJobs(jobs: Array<() => Promise<void>>): Promise<void> {
	for (let i = 0; i < jobs.length; i++) {
		try {
			await jobs[i]();
		} catch (error) {
			console.error(`[Cron] Sequential job ${i} failed:`, error);
			throw error;
		}
	}
}
