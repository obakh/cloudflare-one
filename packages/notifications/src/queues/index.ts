/**
 * Cloudflare Queues Helpers
 *
 * Utilities for working with Cloudflare Queues for async job processing.
 *
 * @see https://developers.cloudflare.com/queues/
 *
 * Limits:
 * - 128 KB max message size
 * - 100 messages max per batch
 * - 5,000 messages/second throughput
 * - 4-14 days retention
 * - 15 min consumer duration
 */

/**
 * Queue binding interface (from Cloudflare Workers types)
 */
export interface Queue<T = unknown> {
	send(message: T, options?: QueueSendOptions): Promise<void>;
	sendBatch(messages: Iterable<MessageSendRequest<T>>): Promise<void>;
}

/**
 * Options for sending a message
 */
export interface QueueSendOptions {
	/** Delay before message is delivered (max 12 hours) */
	delaySeconds?: number;
	/** Content type: json (default), text, bytes, v8 */
	contentType?: "json" | "text" | "bytes" | "v8";
}

/**
 * Message send request for batch operations
 */
export interface MessageSendRequest<T = unknown> {
	body: T;
	options?: QueueSendOptions;
}

/**
 * Message from a queue batch
 */
export interface QueueMessage<T = unknown> {
	/** Message ID */
	readonly id: string;
	/** Message body */
	readonly body: T;
	/** Timestamp when message was sent */
	readonly timestamp: Date;
	/** Number of delivery attempts */
	readonly attempts: number;
	/** Acknowledge message (mark as processed) */
	ack(): void;
	/** Retry message with optional delay */
	retry(options?: { delaySeconds?: number }): void;
}

/**
 * Batch of messages from a queue
 */
export interface MessageBatch<T = unknown> {
	/** Queue name */
	readonly queue: string;
	/** Messages in the batch */
	readonly messages: readonly QueueMessage<T>[];
	/** Acknowledge all messages */
	ackAll(): void;
	/** Retry all messages */
	retryAll(options?: { delaySeconds?: number }): void;
}

/**
 * Job types for type-safe queue messages
 */
export interface JobTypes {
	[key: string]: unknown;
}

/**
 * Job handler function type
 */
export type JobHandler<T, Env = unknown> = (
	payload: T,
	message: QueueMessage<{ type: string; payload: T }>,
	env: Env,
) => Promise<void>;

/**
 * Create a typed queue producer
 *
 * @example
 * ```ts
 * // Define job types
 * interface MyJobs {
 *   "email:send": { to: string; subject: string; html: string };
 *   "user:welcome": { userId: string; email: string };
 *   "report:generate": { reportId: string; format: "pdf" | "csv" };
 * }
 *
 * // Create producer
 * const jobs = createQueueProducer<MyJobs>(env.MY_QUEUE);
 *
 * // Send typed job
 * await jobs.send("email:send", {
 *   to: "user@example.com",
 *   subject: "Hello",
 *   html: "<p>Hi!</p>",
 * });
 *
 * // Send with delay
 * await jobs.sendDelayed("report:generate", { reportId: "123", format: "pdf" }, 60);
 * ```
 */
export function createQueueProducer<T extends JobTypes>(queue: Queue) {
	return {
		/**
		 * Send a job to the queue
		 */
		async send<K extends keyof T>(
			type: K,
			payload: T[K],
			options?: QueueSendOptions,
		): Promise<void> {
			await queue.send({ type, payload }, options);
		},

		/**
		 * Send multiple jobs to the queue (max 100 per batch)
		 */
		async sendBatch<K extends keyof T>(
			jobs: Array<{ type: K; payload: T[K]; options?: QueueSendOptions }>,
		): Promise<void> {
			const messages = jobs.map((job) => ({
				body: { type: job.type, payload: job.payload },
				options: job.options,
			}));
			await queue.sendBatch(messages);
		},

		/**
		 * Send a delayed job (max 12 hours delay)
		 */
		async sendDelayed<K extends keyof T>(
			type: K,
			payload: T[K],
			delaySeconds: number,
		): Promise<void> {
			await queue.send({ type, payload }, { delaySeconds });
		},

		/**
		 * Get the underlying queue for direct access
		 */
		raw: queue,
	};
}

/**
 * Create a typed queue consumer
 *
 * @example
 * ```ts
 * // Define handlers
 * const consumer = createQueueConsumer<MyJobs, Env>({
 *   "email:send": async (payload, message, env) => {
 *     await sendEmail(env, payload.to, payload.subject, payload.html);
 *     // message.ack() is called automatically on success
 *   },
 *   "user:welcome": async (payload, message, env) => {
 *     await sendWelcomeEmail(env, payload.userId, payload.email);
 *   },
 * });
 *
 * // In your Worker
 * export default {
 *   async queue(batch, env, ctx) {
 *     await consumer.process(batch, env);
 *   },
 * };
 * ```
 */
export function createQueueConsumer<T extends JobTypes, Env = unknown>(
	handlers: { [K in keyof T]?: JobHandler<T[K], Env> },
) {
	return {
		/**
		 * Process a batch of messages
		 */
		async process(
			batch: MessageBatch<{ type: keyof T; payload: T[keyof T] }>,
			env: Env,
		): Promise<void> {
			for (const message of batch.messages) {
				const { type, payload } = message.body;
				const handler = handlers[type];

				if (handler) {
					try {
						await handler(
							payload,
							message as QueueMessage<{ type: string; payload: T[keyof T] }>,
							env,
						);
						message.ack();
					} catch (error) {
						console.error(`[Queue] Job ${String(type)} failed:`, error);
						message.retry({ delaySeconds: 5 });
					}
				} else {
					console.warn(`[Queue] No handler for job type: ${String(type)}`);
					message.ack(); // Acknowledge unknown messages to prevent infinite retries
				}
			}
		},

		/**
		 * Process with custom error handling
		 */
		async processWithRetry(
			batch: MessageBatch<{ type: keyof T; payload: T[keyof T] }>,
			env: Env,
			options: { maxRetries?: number; retryDelaySeconds?: number } = {},
		): Promise<void> {
			const { maxRetries = 3, retryDelaySeconds = 5 } = options;

			for (const message of batch.messages) {
				const { type, payload } = message.body;
				const handler = handlers[type];

				if (handler) {
					try {
						await handler(
							payload,
							message as QueueMessage<{ type: string; payload: T[keyof T] }>,
							env,
						);
						message.ack();
					} catch (error) {
						console.error(
							`[Queue] Job ${String(type)} failed (attempt ${message.attempts}):`,
							error,
						);

						if (message.attempts >= maxRetries) {
							console.error(`[Queue] Job ${String(type)} exceeded max retries, acknowledging`);
							message.ack(); // Will go to DLQ if configured
						} else {
							message.retry({ delaySeconds: retryDelaySeconds * message.attempts });
						}
					}
				} else {
					console.warn(`[Queue] No handler for job type: ${String(type)}`);
					message.ack();
				}
			}
		},
	};
}

/**
 * Simple queue send helper (without typed producer)
 *
 * @example
 * ```ts
 * import { sendToQueue } from "@repo/notifications/queues";
 *
 * await sendToQueue(env.MY_QUEUE, { action: "process", data: {...} });
 * ```
 */
export async function sendToQueue<T>(
	queue: Queue<T>,
	message: T,
	options?: QueueSendOptions,
): Promise<void> {
	await queue.send(message, options);
}

/**
 * Send batch of messages to queue (max 100 messages or 256KB total)
 */
export async function sendBatchToQueue<T>(
	queue: Queue<T>,
	messages: T[],
	options?: QueueSendOptions,
): Promise<void> {
	const batch = messages.map((body) => ({ body, options }));
	await queue.sendBatch(batch);
}

/**
 * Process all messages in a batch with a single handler
 *
 * @example
 * ```ts
 * export default {
 *   async queue(batch, env) {
 *     await processMessages(batch, async (message, env) => {
 *       console.log("Processing:", message.body);
 *     }, env);
 *   },
 * };
 * ```
 */
export async function processMessages<T, Env>(
	batch: MessageBatch<T>,
	handler: (message: QueueMessage<T>, env: Env) => Promise<void>,
	env: Env,
	options: { retryDelaySeconds?: number } = {},
): Promise<void> {
	const { retryDelaySeconds = 5 } = options;

	for (const message of batch.messages) {
		try {
			await handler(message, env);
			message.ack();
		} catch (error) {
			console.error(`[Queue] Message ${message.id} failed:`, error);
			message.retry({ delaySeconds: retryDelaySeconds });
		}
	}
}

/**
 * Common delay values in seconds
 */
export const DELAYS = {
	/** 1 second */
	IMMEDIATE: 1,
	/** 5 seconds */
	SHORT: 5,
	/** 30 seconds */
	MEDIUM: 30,
	/** 1 minute */
	ONE_MINUTE: 60,
	/** 5 minutes */
	FIVE_MINUTES: 300,
	/** 15 minutes */
	FIFTEEN_MINUTES: 900,
	/** 1 hour */
	ONE_HOUR: 3600,
	/** 12 hours (max) */
	MAX_DELAY: 43200,
} as const;
