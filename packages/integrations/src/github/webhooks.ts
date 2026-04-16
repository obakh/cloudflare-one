/**
 * GitHub Webhook handling for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createGitHubWebhookHandler } from "@repo/integrations/github/webhooks";
 *
 * const handler = createGitHubWebhookHandler(env.GITHUB_WEBHOOK_SECRET, {
 *   push: async (event) => {
 *     console.log("Push to", event.repository.full_name);
 *   },
 *   pull_request: async (event) => {
 *     if (event.action === "opened") {
 *       console.log("PR opened:", event.pull_request.title);
 *     }
 *   },
 *   issues: async (event) => {
 *     console.log("Issue:", event.action, event.issue.title);
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

export type GitHubWebhookEvent =
	| "branch_protection_rule"
	| "check_run"
	| "check_suite"
	| "code_scanning_alert"
	| "commit_comment"
	| "create"
	| "delete"
	| "dependabot_alert"
	| "deploy_key"
	| "deployment"
	| "deployment_status"
	| "discussion"
	| "discussion_comment"
	| "fork"
	| "github_app_authorization"
	| "gollum"
	| "installation"
	| "installation_repositories"
	| "installation_target"
	| "issue_comment"
	| "issues"
	| "label"
	| "marketplace_purchase"
	| "member"
	| "membership"
	| "merge_group"
	| "meta"
	| "milestone"
	| "org_block"
	| "organization"
	| "package"
	| "page_build"
	| "ping"
	| "project"
	| "project_card"
	| "project_column"
	| "projects_v2"
	| "projects_v2_item"
	| "public"
	| "pull_request"
	| "pull_request_review"
	| "pull_request_review_comment"
	| "pull_request_review_thread"
	| "push"
	| "registry_package"
	| "release"
	| "repository"
	| "repository_dispatch"
	| "repository_import"
	| "repository_vulnerability_alert"
	| "secret_scanning_alert"
	| "security_advisory"
	| "sponsorship"
	| "star"
	| "status"
	| "team"
	| "team_add"
	| "watch"
	| "workflow_dispatch"
	| "workflow_job"
	| "workflow_run";

export interface GitHubWebhookPayload {
	action?: string;
	sender: {
		id: number;
		login: string;
		avatar_url: string;
		type: string;
	};
	repository?: {
		id: number;
		node_id: string;
		name: string;
		full_name: string;
		private: boolean;
		owner: {
			id: number;
			login: string;
			avatar_url: string;
		};
		html_url: string;
		default_branch: string;
	};
	organization?: {
		id: number;
		login: string;
		avatar_url: string;
	};
	installation?: {
		id: number;
		node_id: string;
	};
}

export interface GitHubPushPayload extends GitHubWebhookPayload {
	ref: string;
	before: string;
	after: string;
	created: boolean;
	deleted: boolean;
	forced: boolean;
	compare: string;
	commits: Array<{
		id: string;
		message: string;
		timestamp: string;
		author: { name: string; email: string; username?: string };
		committer: { name: string; email: string; username?: string };
		added: string[];
		removed: string[];
		modified: string[];
	}>;
	head_commit: {
		id: string;
		message: string;
		timestamp: string;
		author: { name: string; email: string; username?: string };
	} | null;
	pusher: { name: string; email: string };
}

export interface GitHubPullRequestPayload extends GitHubWebhookPayload {
	action:
		| "opened"
		| "closed"
		| "reopened"
		| "edited"
		| "assigned"
		| "unassigned"
		| "review_requested"
		| "review_request_removed"
		| "labeled"
		| "unlabeled"
		| "synchronize"
		| "converted_to_draft"
		| "ready_for_review"
		| "locked"
		| "unlocked";
	number: number;
	pull_request: {
		id: number;
		node_id: string;
		number: number;
		state: "open" | "closed";
		locked: boolean;
		title: string;
		body: string | null;
		html_url: string;
		diff_url: string;
		patch_url: string;
		merged: boolean;
		merged_at: string | null;
		merge_commit_sha: string | null;
		draft: boolean;
		head: { ref: string; sha: string; repo: { full_name: string } };
		base: { ref: string; sha: string; repo: { full_name: string } };
		user: { id: number; login: string; avatar_url: string };
		created_at: string;
		updated_at: string;
	};
}

export interface GitHubIssuesPayload extends GitHubWebhookPayload {
	action:
		| "opened"
		| "edited"
		| "deleted"
		| "pinned"
		| "unpinned"
		| "closed"
		| "reopened"
		| "assigned"
		| "unassigned"
		| "labeled"
		| "unlabeled"
		| "locked"
		| "unlocked"
		| "transferred"
		| "milestoned"
		| "demilestoned";
	issue: {
		id: number;
		node_id: string;
		number: number;
		title: string;
		body: string | null;
		state: "open" | "closed";
		locked: boolean;
		html_url: string;
		user: { id: number; login: string; avatar_url: string };
		labels: Array<{ id: number; name: string; color: string }>;
		created_at: string;
		updated_at: string;
		closed_at: string | null;
	};
}

export interface GitHubIssueCommentPayload extends GitHubWebhookPayload {
	action: "created" | "edited" | "deleted";
	issue: GitHubIssuesPayload["issue"];
	comment: {
		id: number;
		node_id: string;
		body: string;
		html_url: string;
		user: { id: number; login: string; avatar_url: string };
		created_at: string;
		updated_at: string;
	};
}

export interface GitHubReleasePayload extends GitHubWebhookPayload {
	action:
		| "published"
		| "unpublished"
		| "created"
		| "edited"
		| "deleted"
		| "prereleased"
		| "released";
	release: {
		id: number;
		node_id: string;
		tag_name: string;
		name: string | null;
		body: string | null;
		draft: boolean;
		prerelease: boolean;
		html_url: string;
		tarball_url: string;
		zipball_url: string;
		created_at: string;
		published_at: string | null;
		author: { id: number; login: string; avatar_url: string };
	};
}

export interface GitHubWorkflowRunPayload extends GitHubWebhookPayload {
	action: "requested" | "completed" | "in_progress";
	workflow_run: {
		id: number;
		node_id: string;
		name: string;
		head_branch: string;
		head_sha: string;
		status: "queued" | "in_progress" | "completed";
		conclusion:
			| "success"
			| "failure"
			| "cancelled"
			| "skipped"
			| "timed_out"
			| "action_required"
			| null;
		html_url: string;
		created_at: string;
		updated_at: string;
	};
	workflow: {
		id: number;
		name: string;
		path: string;
	};
}

export interface GitHubPingPayload extends GitHubWebhookPayload {
	zen: string;
	hook_id: number;
	hook: {
		type: string;
		id: number;
		name: string;
		active: boolean;
		events: string[];
		config: { url: string; content_type: string };
	};
}

// Handler types
type WebhookHandler<T extends GitHubWebhookPayload> = (payload: T) => Promise<void> | void;

export type GitHubWebhookHandlers = {
	push?: WebhookHandler<GitHubPushPayload>;
	pull_request?: WebhookHandler<GitHubPullRequestPayload>;
	issues?: WebhookHandler<GitHubIssuesPayload>;
	issue_comment?: WebhookHandler<GitHubIssueCommentPayload>;
	release?: WebhookHandler<GitHubReleasePayload>;
	workflow_run?: WebhookHandler<GitHubWorkflowRunPayload>;
	ping?: WebhookHandler<GitHubPingPayload>;
};

// ============================================================================
// Webhook Verification
// ============================================================================

/**
 * Verify GitHub webhook signature
 */
export async function verifyGitHubWebhook(
	payload: string,
	signature: string,
	secret: string,
): Promise<boolean> {
	if (!signature.startsWith("sha256=")) {
		return false;
	}

	const expectedSignature = await computeHmacSha256(secret, payload);
	const actualSignature = signature.slice(7); // Remove "sha256=" prefix

	return timingSafeEqual(expectedSignature, actualSignature);
}

// ============================================================================
// Webhook Handler
// ============================================================================

/**
 * Create a GitHub webhook handler
 */
export function createGitHubWebhookHandler(
	secret: string,
	handlers: GitHubWebhookHandlers,
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const signature = request.headers.get("x-hub-signature-256");
		const event = request.headers.get("x-github-event") as GitHubWebhookEvent;
		const deliveryId = request.headers.get("x-github-delivery");

		if (!signature || !event) {
			return new Response("Missing signature or event", { status: 400 });
		}

		const payload = await request.text();

		// Verify signature
		const isValid = await verifyGitHubWebhook(payload, signature, secret);
		if (!isValid) {
			return new Response("Invalid signature", { status: 401 });
		}

		try {
			const data = JSON.parse(payload);
			const handler = handlers[event as keyof GitHubWebhookHandlers];

			if (handler) {
				await (handler as (payload: GitHubWebhookPayload) => Promise<void>)(data);
			}

			return new Response(
				JSON.stringify({
					received: true,
					event,
					deliveryId,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("GitHub webhook error:", message);

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
export function githubWebhook<Env extends { GITHUB_WEBHOOK_SECRET?: string }>(options: {
	secret: string | ((c: { env: Env }) => string);
	handlers: GitHubWebhookHandlers;
	onError?: (error: Error, c: { env: Env }) => Response | Promise<Response>;
}) {
	return async (c: {
		req: { raw: Request };
		env: Env;
		json: (data: unknown, status?: number) => Response;
	}) => {
		const secret = typeof options.secret === "function" ? options.secret(c) : options.secret;
		const handler = createGitHubWebhookHandler(secret, options.handlers);

		try {
			return await handler(c.req.raw);
		} catch (error) {
			if (options.onError && error instanceof Error) {
				return options.onError(error, c);
			}
			throw error;
		}
	};
}

// ============================================================================
// Common Event Groups
// ============================================================================

export const GITHUB_PR_EVENTS = [
	"pull_request",
	"pull_request_review",
	"pull_request_review_comment",
	"pull_request_review_thread",
] as const;

export const GITHUB_ISSUE_EVENTS = ["issues", "issue_comment"] as const;

export const GITHUB_CI_EVENTS = [
	"check_run",
	"check_suite",
	"workflow_job",
	"workflow_run",
	"deployment",
	"deployment_status",
] as const;

export const GITHUB_REPO_EVENTS = [
	"push",
	"create",
	"delete",
	"fork",
	"release",
	"repository",
] as const;
