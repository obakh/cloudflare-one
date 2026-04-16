/**
 * Linear Webhook handling for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createLinearWebhookHandler } from "@repo/integrations/linear/webhooks";
 *
 * const handler = createLinearWebhookHandler(env.LINEAR_WEBHOOK_SECRET, {
 *   Issue: async (event) => {
 *     if (event.action === "create") {
 *       console.log("Issue created:", event.data.title);
 *     }
 *   },
 *   Comment: async (event) => {
 *     console.log("Comment:", event.action, event.data.body);
 *   },
 * });
 *
 * export default { fetch: handler };
 * ```
 */

import { computeHmacSha256, timingSafeEqual } from "@repo/security/crypto";

// ============================================================================
// Types
// ============================================================================

export type LinearWebhookType =
	| "Issue"
	| "Comment"
	| "IssueLabel"
	| "Project"
	| "ProjectUpdate"
	| "Cycle"
	| "Reaction"
	| "Attachment";

export type LinearWebhookAction = "create" | "update" | "remove";

export interface LinearWebhookPayload<T = unknown> {
	action: LinearWebhookAction;
	type: LinearWebhookType;
	createdAt: string;
	data: T;
	url: string;
	organizationId: string;
	webhookTimestamp: number;
	webhookId: string;
}

export interface LinearIssue {
	id: string;
	identifier: string;
	title: string;
	description?: string;
	priority: number;
	priorityLabel: string;
	state: {
		id: string;
		name: string;
		type: string;
		color: string;
	};
	team: {
		id: string;
		key: string;
		name: string;
	};
	assignee?: {
		id: string;
		name: string;
		email: string;
	};
	creator?: {
		id: string;
		name: string;
		email: string;
	};
	labels: Array<{
		id: string;
		name: string;
		color: string;
	}>;
	project?: {
		id: string;
		name: string;
	};
	cycle?: {
		id: string;
		name: string;
		number: number;
	};
	estimate?: number;
	dueDate?: string;
	createdAt: string;
	updatedAt: string;
	completedAt?: string;
	canceledAt?: string;
	url: string;
}

export interface LinearComment {
	id: string;
	body: string;
	issue: {
		id: string;
		identifier: string;
		title: string;
	};
	user: {
		id: string;
		name: string;
		email: string;
	};
	createdAt: string;
	updatedAt: string;
	url: string;
}

export interface LinearProject {
	id: string;
	name: string;
	description?: string;
	state: string;
	progress: number;
	targetDate?: string;
	startDate?: string;
	lead?: {
		id: string;
		name: string;
	};
	teams: Array<{
		id: string;
		name: string;
	}>;
	createdAt: string;
	updatedAt: string;
	url: string;
}

export interface LinearCycle {
	id: string;
	name: string;
	number: number;
	startsAt: string;
	endsAt: string;
	progress: number;
	team: {
		id: string;
		name: string;
	};
	createdAt: string;
	updatedAt: string;
}

// Handler types
type WebhookHandler<T> = (payload: LinearWebhookPayload<T>) => Promise<void> | void;

export type LinearWebhookHandlers = {
	Issue?: WebhookHandler<LinearIssue>;
	Comment?: WebhookHandler<LinearComment>;
	Project?: WebhookHandler<LinearProject>;
	Cycle?: WebhookHandler<LinearCycle>;
	IssueLabel?: WebhookHandler<unknown>;
	ProjectUpdate?: WebhookHandler<unknown>;
	Reaction?: WebhookHandler<unknown>;
	Attachment?: WebhookHandler<unknown>;
};

// ============================================================================
// Webhook Verification
// ============================================================================

/**
 * Verify Linear webhook signature
 */
export async function verifyLinearWebhook(
	payload: string,
	signature: string,
	secret: string,
): Promise<boolean> {
	const expectedSignature = await computeHmacSha256(secret, payload);
	return timingSafeEqual(expectedSignature, signature);
}

// ============================================================================
// Webhook Handler
// ============================================================================

/**
 * Create a Linear webhook handler
 */
export function createLinearWebhookHandler(
	secret: string,
	handlers: LinearWebhookHandlers,
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const signature = request.headers.get("linear-signature");
		const deliveryId = request.headers.get("linear-delivery");

		if (!signature) {
			return new Response("Missing signature", { status: 400 });
		}

		const payload = await request.text();

		// Verify signature
		const isValid = await verifyLinearWebhook(payload, signature, secret);
		if (!isValid) {
			return new Response("Invalid signature", { status: 401 });
		}

		try {
			const data = JSON.parse(payload) as LinearWebhookPayload;
			const handler = handlers[data.type as keyof LinearWebhookHandlers];

			if (handler) {
				await (handler as WebhookHandler<unknown>)(data);
			}

			return new Response(
				JSON.stringify({
					received: true,
					type: data.type,
					action: data.action,
					deliveryId,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Linear webhook error:", message);

			return new Response(JSON.stringify({ error: message }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	};
}

/**
 * Hono-compatible middleware
 */
export function linearWebhook<Env extends { LINEAR_WEBHOOK_SECRET?: string }>(options: {
	secret: string | ((c: { env: Env }) => string);
	handlers: LinearWebhookHandlers;
}) {
	return async (c: { req: { raw: Request }; env: Env }) => {
		const secret = typeof options.secret === "function" ? options.secret(c) : options.secret;
		const handler = createLinearWebhookHandler(secret, options.handlers);
		return handler(c.req.raw);
	};
}
