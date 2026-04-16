/**
 * @repo/notifications - Notification utilities for Cloudflare Workers
 *
 * Provides email sending (multiple providers), queue-based job processing,
 * incoming email handling, and build event notifications.
 *
 * @example Email with React Email templates (Resend)
 * ```ts
 * import { createEmailClient } from "@repo/notifications/email";
 * import { createResendProvider } from "@repo/notifications/email/providers/resend";
 * import { WelcomeEmail } from "@repo/notifications/email/templates";
 *
 * const email = createEmailClient(createResendProvider({ apiKey: env.RESEND_API_KEY }));
 *
 * await email.send({
 *   from: "Acme <hello@acme.com>",
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   react: <WelcomeEmail name="John" appName="Acme" />,
 * });
 * ```
 *
 * @example Email with Cloudflare Email Service (Workers binding)
 * ```ts
 * import { createEmailClient } from "@repo/notifications/email";
 * import { createCloudflareProvider } from "@repo/notifications/email/providers/cloudflare";
 *
 * const email = createEmailClient(createCloudflareProvider({ binding: env.EMAIL }));
 *
 * await email.send({
 *   from: "welcome@yourdomain.com",
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   html: "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
 * });
 * ```
 *
 * @example Email with Cloudflare Email Service (REST API)
 * ```ts
 * import { createEmailClient } from "@repo/notifications/email";
 * import { createCloudflareProvider } from "@repo/notifications/email/providers/cloudflare";
 *
 * const email = createEmailClient(createCloudflareProvider({
 *   accountId: env.CLOUDFLARE_ACCOUNT_ID,
 *   apiToken: env.CLOUDFLARE_API_TOKEN,
 * }));
 *
 * await email.send({
 *   from: "welcome@yourdomain.com",
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   html: "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
 * });
 * ```
 *
 * @example Queues (Producer)
 * ```ts
 * import { createQueueProducer } from "@repo/notifications/queues";
 *
 * interface Jobs {
 *   "email:send": { to: string; subject: string };
 *   "report:generate": { reportId: string };
 * }
 *
 * const jobs = createQueueProducer<Jobs>(env.MY_QUEUE);
 * await jobs.send("email:send", { to: "user@example.com", subject: "Hello" });
 * ```
 *
 * @example Build Events (Workers Builds notifications)
 * ```ts
 * import { createBuildEventsConsumer } from "@repo/notifications/build-events";
 *
 * const consumer = createBuildEventsConsumer({
 *   apiToken: env.CLOUDFLARE_API_TOKEN,
 *   slackWebhookUrl: env.SLACK_WEBHOOK_URL,
 * });
 *
 * export default {
 *   async queue(batch, env) {
 *     await consumer.process(batch);
 *   },
 * };
 * ```
 */

// Email
export * from "./email";
export * from "./email/types";

// Queues
export * from "./queues";
