/**
 * @repo/scheduling - Scheduling utilities for Cloudflare Workers
 *
 * Provides helpers for cron triggers and scheduled jobs.
 *
 * @example Basic cron scheduler
 * ```ts
 * import { createCronScheduler, CRON_PATTERNS } from "@repo/scheduling/cron";
 *
 * const scheduler = createCronScheduler<Env>({
 *   [CRON_PATTERNS.EVERY_HOUR]: async (env) => {
 *     await syncData(env);
 *   },
 *   [CRON_PATTERNS.DAILY_MIDNIGHT]: async (env) => {
 *     await cleanupOldRecords(env);
 *   },
 * });
 *
 * export default {
 *   async fetch(request, env) {
 *     return new Response("OK");
 *   },
 *   scheduled: scheduler.handle,
 * };
 * ```
 *
 * @example wrangler.jsonc configuration
 * ```jsonc
 * {
 *   "triggers": {
 *     "crons": ["0 * * * *", "0 0 * * *"]
 *   }
 * }
 * ```
 */

export * from "./cron";
