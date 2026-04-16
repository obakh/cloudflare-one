/**
 * Workers Builds event handling for notifications
 *
 * Process Cloudflare Workers Builds events and send notifications
 * to Slack, Discord, or custom webhooks.
 *
 * @example Basic usage with Queue consumer
 * ```ts
 * import {
 *   handleBuildEvent,
 *   sendSlackNotification,
 *   type BuildEvent
 * } from "@repo/notifications/build-events";
 *
 * export default {
 *   async queue(batch: MessageBatch<BuildEvent>, env: Env) {
 *     for (const msg of batch.messages) {
 *       const notification = await handleBuildEvent(msg.body, {
 *         apiToken: env.CLOUDFLARE_API_TOKEN,
 *       });
 *       if (notification) {
 *         await sendSlackNotification(env.SLACK_WEBHOOK_URL, notification);
 *       }
 *       msg.ack();
 *     }
 *   },
 * };
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface BuildEvent {
	type: string;
	source: {
		type: string;
		workerName?: string;
	};
	payload: {
		buildUuid: string;
		status: string;
		buildOutcome: "success" | "failure" | "canceled" | "cancelled" | null;
		createdAt: string;
		initializingAt?: string;
		runningAt?: string;
		stoppedAt?: string;
		buildTriggerMetadata?: BuildTriggerMetadata;
	};
	metadata: {
		accountId: string;
		eventSubscriptionId?: string;
		eventSchemaVersion?: number;
		eventTimestamp: string;
	};
}

export interface BuildTriggerMetadata {
	buildTriggerSource: string;
	branch: string;
	commitHash: string;
	commitMessage: string;
	author: string;
	buildCommand?: string;
	deployCommand?: string;
	rootDirectory?: string;
	repoName: string;
	providerAccountName: string;
	providerType: "github" | "gitlab" | string;
}

export interface BuildStatus {
	isSucceeded: boolean;
	isFailed: boolean;
	isCancelled: boolean;
}

export interface BuildNotification {
	status: "success" | "failure" | "cancelled";
	workerName: string;
	branch?: string;
	commitHash?: string;
	commitMessage?: string;
	author?: string;
	commitUrl?: string;
	dashboardUrl?: string;
	previewUrl?: string;
	liveUrl?: string;
	error?: string;
	isProduction: boolean;
}

export interface HandleBuildEventOptions {
	/** Cloudflare API token for fetching build details */
	apiToken?: string;
	/** Custom production branch names (default: main, master, production, prod) */
	productionBranches?: string[];
}

export interface SlackBlock {
	type: string;
	text?: { type: string; text: string };
	accessory?: {
		type: string;
		text: { type: string; text: string };
		url: string;
		style?: string;
	};
	elements?: Array<{ type: string; text: string }>;
}

export interface SlackPayload {
	blocks: SlackBlock[];
}

// ============================================================================
// Status Helpers
// ============================================================================

/**
 * Determine build status from event
 */
export function getBuildStatus(event: BuildEvent): BuildStatus {
	const buildOutcome = event.payload?.buildOutcome;
	const isCancelled =
		buildOutcome === "canceled" ||
		buildOutcome === "cancelled" ||
		event.type?.includes("canceled") ||
		event.type?.includes("cancelled");
	const isFailed = event.type?.includes("failed") && !isCancelled;
	const isSucceeded = event.type?.includes("succeeded");

	return { isSucceeded, isFailed, isCancelled };
}

/**
 * Check if branch is a production branch
 */
export function isProductionBranch(branch: string | undefined, customBranches?: string[]): boolean {
	if (!branch) return true;
	const prodBranches = customBranches || ["main", "master", "production", "prod"];
	return prodBranches.includes(branch.toLowerCase());
}

/**
 * Check if event should be skipped (started/queued events)
 */
export function shouldSkipEvent(event: BuildEvent): boolean {
	return event.type?.includes("started") || event.type?.includes("queued") || false;
}

// ============================================================================
// Metadata Extraction
// ============================================================================

/**
 * Extract author name from email
 */
export function extractAuthorName(author: string | undefined): string | null {
	if (!author) return null;
	if (author.includes("@")) {
		const name = author.split("@")[0];
		return name || author;
	}
	return author;
}

/**
 * Generate commit URL for GitHub/GitLab
 */
export function getCommitUrl(event: BuildEvent): string | null {
	const meta = event.payload?.buildTriggerMetadata;
	if (!meta?.repoName || !meta?.commitHash || !meta?.providerAccountName) {
		return null;
	}

	if (meta.providerType === "github") {
		return `https://github.com/${meta.providerAccountName}/${meta.repoName}/commit/${meta.commitHash}`;
	}
	if (meta.providerType === "gitlab") {
		return `https://gitlab.com/${meta.providerAccountName}/${meta.repoName}/-/commit/${meta.commitHash}`;
	}
	return null;
}

/**
 * Generate Cloudflare dashboard URL for build
 */
export function getDashboardUrl(event: BuildEvent): string | null {
	const accountId = event.metadata?.accountId;
	const buildUuid = event.payload?.buildUuid;
	const workerName =
		event.source?.workerName || event.payload?.buildTriggerMetadata?.repoName || "worker";

	if (!accountId || !buildUuid) return null;

	return `https://dash.cloudflare.com/${accountId}/workers/services/view/${workerName}/production/builds/${buildUuid}`;
}

// ============================================================================
// API Helpers
// ============================================================================

interface BuildDetailsResponse {
	result?: { preview_url?: string };
}

interface SubdomainResponse {
	result?: { subdomain?: string };
}

interface LogsResponse {
	result?: {
		lines?: [number, string][];
		truncated?: boolean;
		cursor?: string;
	};
}

/**
 * Fetch preview/live URLs for successful build
 */
export async function fetchBuildUrls(
	event: BuildEvent,
	apiToken: string,
): Promise<{ previewUrl: string | null; liveUrl: string | null }> {
	const workerName = event.source?.workerName || event.payload.buildTriggerMetadata?.repoName;
	const accountId = event.metadata.accountId;

	if (!workerName || !accountId) {
		return { previewUrl: null, liveUrl: null };
	}

	try {
		const buildRes = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${accountId}/builds/builds/${event.payload.buildUuid}`,
			{ headers: { Authorization: `Bearer ${apiToken}` } },
		);
		const buildData: BuildDetailsResponse = await buildRes.json();

		if (buildData.result?.preview_url) {
			return { previewUrl: buildData.result.preview_url, liveUrl: null };
		}

		const subRes = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
			{ headers: { Authorization: `Bearer ${apiToken}` } },
		);
		const subData: SubdomainResponse = await subRes.json();

		if (subData.result?.subdomain) {
			return {
				previewUrl: null,
				liveUrl: `https://${workerName}.${subData.result.subdomain}.workers.dev`,
			};
		}
	} catch (error) {
		console.error("Failed to fetch URLs:", error);
	}

	return { previewUrl: null, liveUrl: null };
}

/**
 * Fetch build logs for failed build
 */
export async function fetchBuildLogs(
	event: BuildEvent,
	apiToken: string,
	maxPages = 50,
): Promise<string[]> {
	const accountId = event.metadata.accountId;
	if (!accountId) return [];

	const logs: string[] = [];

	try {
		let cursor: string | null = null;
		let pageCount = 0;

		do {
			const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/builds/builds/${event.payload.buildUuid}/logs${cursor ? `?cursor=${cursor}` : ""}`;

			const res = await fetch(endpoint, {
				headers: { Authorization: `Bearer ${apiToken}` },
			});
			const data: LogsResponse = await res.json();

			if (data.result?.lines?.length) {
				logs.push(...data.result.lines.map((l) => l[1]));
			}

			cursor = data.result?.truncated ? (data.result?.cursor ?? null) : null;
			pageCount++;
		} while (cursor && pageCount < maxPages);
	} catch (error) {
		console.error("Failed to fetch logs:", error);
	}

	return logs;
}

// ============================================================================
// Error Extraction
// ============================================================================

const IGNORE_PATTERNS = [
	/^Total Upload:/i,
	/^Total Size:/i,
	/\/\s*gzip:/i,
	/^\d+\.\d+\s*(KiB|MiB|B)/i,
	/^Uploaded/i,
	/^Published/i,
	/^Worker Startup Time:/i,
	/^🌀/,
];

const ERROR_PATTERNS = [/^✘\s*\[ERROR\]/i, /^\[ERROR\]/i, /^ERROR:/i, /^Error:/, /^❌/];

const ERROR_KEYWORDS = [
	"Module not found",
	"Cannot find module",
	"Compilation failed",
	"Build failed",
	"SyntaxError:",
	"TypeError:",
	"ReferenceError:",
	"failed to",
	"Failed to",
];

/**
 * Extract error message from build logs
 */
export function extractBuildError(logs: string[], maxLength = 500): string {
	if (!logs?.length) return "No logs available";

	for (let i = 0; i < logs.length; i++) {
		const line = logs[i];
		if (!line?.trim()) continue;
		if (line.trim().startsWith("at ")) continue;
		if (IGNORE_PATTERNS.some((p) => p.test(line))) continue;

		if (ERROR_PATTERNS.some((p) => p.test(line))) {
			let errorMsg = line.trim();
			if (logs[i + 1]) {
				const nextLine = logs[i + 1].trim();
				if (
					nextLine &&
					!nextLine.startsWith("at ") &&
					!IGNORE_PATTERNS.some((p) => p.test(nextLine))
				) {
					errorMsg += `\n${nextLine}`;
				}
			}
			return errorMsg.length > maxLength ? `${errorMsg.substring(0, maxLength)}...` : errorMsg;
		}
	}

	for (const line of logs) {
		if (!line?.trim()) continue;
		if (IGNORE_PATTERNS.some((p) => p.test(line))) continue;
		if (ERROR_KEYWORDS.some((k) => line.includes(k))) {
			return line.trim().length > maxLength
				? `${line.trim().substring(0, maxLength)}...`
				: line.trim();
		}
	}

	for (let i = logs.length - 1; i >= 0; i--) {
		const line = logs[i]?.trim();
		if (line && !IGNORE_PATTERNS.some((p) => p.test(line))) {
			return line.length > maxLength ? `${line.substring(0, maxLength)}...` : line;
		}
	}

	return "Build failed";
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * Process a build event and return notification data
 * Returns null for events that shouldn't trigger notifications
 */
export async function handleBuildEvent(
	event: BuildEvent,
	options: HandleBuildEventOptions = {},
): Promise<BuildNotification | null> {
	if (!event?.type || !event?.payload || !event?.metadata) {
		console.error("Invalid event structure");
		return null;
	}

	if (shouldSkipEvent(event)) {
		return null;
	}

	const status = getBuildStatus(event);
	const meta = event.payload.buildTriggerMetadata;
	const workerName = event.source?.workerName || meta?.repoName || "Worker";
	const isProd = isProductionBranch(meta?.branch, options.productionBranches);

	const notification: BuildNotification = {
		status: status.isSucceeded ? "success" : status.isCancelled ? "cancelled" : "failure",
		workerName,
		branch: meta?.branch,
		commitHash: meta?.commitHash,
		commitMessage: meta?.commitMessage,
		author: extractAuthorName(meta?.author) || undefined,
		commitUrl: getCommitUrl(event) || undefined,
		dashboardUrl: getDashboardUrl(event) || undefined,
		isProduction: isProd,
	};

	if (options.apiToken) {
		if (status.isSucceeded) {
			const { previewUrl, liveUrl } = await fetchBuildUrls(event, options.apiToken);
			notification.previewUrl = previewUrl || undefined;
			notification.liveUrl = liveUrl || undefined;
		} else if (status.isFailed && !status.isCancelled) {
			const logs = await fetchBuildLogs(event, options.apiToken);
			notification.error = extractBuildError(logs);
		}
	}

	return notification;
}

// ============================================================================
// Slack Formatting
// ============================================================================

/**
 * Build Slack Block Kit payload from notification
 */
export function buildSlackPayload(notification: BuildNotification): SlackPayload {
	const { status, workerName, isProduction } = notification;

	const blocks: SlackBlock[] = [];

	// Header
	if (status === "success") {
		const title = isProduction ? "Production Deploy" : "Preview Deploy";
		const buttonText = isProduction
			? notification.liveUrl
				? "View Worker"
				: "View Build"
			: notification.previewUrl
				? "View Preview"
				: "View Build";
		const buttonUrl = isProduction
			? notification.liveUrl || notification.dashboardUrl
			: notification.previewUrl || notification.dashboardUrl;

		blocks.push({
			type: "section",
			text: { type: "mrkdwn", text: `✅  *${title}*\n*${workerName}*` },
			...(buttonUrl && {
				accessory: {
					type: "button",
					text: { type: "plain_text", text: buttonText },
					url: buttonUrl,
				},
			}),
		});
	} else if (status === "failure") {
		blocks.push({
			type: "section",
			text: { type: "mrkdwn", text: `❌  *Build Failed*\n*${workerName}*` },
			...(notification.dashboardUrl && {
				accessory: {
					type: "button",
					text: { type: "plain_text", text: "View Logs" },
					url: notification.dashboardUrl,
					style: "danger",
				},
			}),
		});
	} else {
		blocks.push({
			type: "section",
			text: { type: "mrkdwn", text: `⚠️  *Build Cancelled*\n*${workerName}*` },
			...(notification.dashboardUrl && {
				accessory: {
					type: "button",
					text: { type: "plain_text", text: "View Build" },
					url: notification.dashboardUrl,
				},
			}),
		});
	}

	// Context (branch, commit, author)
	const contextElements: Array<{ type: string; text: string }> = [];

	if (notification.branch) {
		contextElements.push({
			type: "mrkdwn",
			text: `*Branch:* \`${notification.branch}\``,
		});
	}

	if (notification.commitHash) {
		const shortHash = notification.commitHash.substring(0, 7);
		contextElements.push({
			type: "mrkdwn",
			text: notification.commitUrl
				? `*Commit:* <${notification.commitUrl}|${shortHash}>`
				: `*Commit:* \`${shortHash}\``,
		});
	}

	if (notification.author) {
		contextElements.push({
			type: "mrkdwn",
			text: `*Author:* ${notification.author}`,
		});
	}

	if (contextElements.length > 0) {
		blocks.push({ type: "context", elements: contextElements });
	}

	// Error message for failures
	if (status === "failure" && notification.error) {
		blocks.push({
			type: "section",
			text: { type: "mrkdwn", text: `\`\`\`${notification.error}\`\`\`` },
		});
	}

	return { blocks };
}

/**
 * Send notification to Slack webhook
 */
export async function sendSlackNotification(
	webhookUrl: string,
	payload: SlackPayload,
): Promise<boolean> {
	try {
		const response = await fetch(webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			console.error("Slack API error:", response.status, await response.text());
			return false;
		}
		return true;
	} catch (error) {
		console.error("Failed to send Slack notification:", error);
		return false;
	}
}

/**
 * Send notification to Discord webhook (uses Slack-compatible format)
 * Append /slack to your Discord webhook URL
 */
export async function sendDiscordNotification(
	webhookUrl: string,
	payload: SlackPayload,
): Promise<boolean> {
	// Discord supports Slack-formatted payloads at /slack endpoint
	const discordUrl = webhookUrl.endsWith("/slack") ? webhookUrl : `${webhookUrl}/slack`;
	return sendSlackNotification(discordUrl, payload);
}

// ============================================================================
// Queue Consumer Helper
// ============================================================================

export interface BuildEventsConsumerOptions extends HandleBuildEventOptions {
	/** Slack webhook URL */
	slackWebhookUrl?: string;
	/** Discord webhook URL */
	discordWebhookUrl?: string;
	/** Custom webhook handler */
	onNotification?: (notification: BuildNotification) => Promise<void>;
}

/**
 * Create a queue consumer for build events
 *
 * @example
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
export function createBuildEventsConsumer(options: BuildEventsConsumerOptions) {
	return {
		async process(batch: MessageBatch<BuildEvent>): Promise<void> {
			for (const message of batch.messages) {
				try {
					const notification = await handleBuildEvent(message.body, options);

					if (notification) {
						const payload = buildSlackPayload(notification);

						if (options.slackWebhookUrl) {
							await sendSlackNotification(options.slackWebhookUrl, payload);
						}

						if (options.discordWebhookUrl) {
							await sendDiscordNotification(options.discordWebhookUrl, payload);
						}

						if (options.onNotification) {
							await options.onNotification(notification);
						}
					}

					message.ack();
				} catch (error) {
					console.error("Error processing build event:", error);
					message.ack();
				}
			}
		},
	};
}
