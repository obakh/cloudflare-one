/**
 * @repo/integrations
 *
 * OAuth, webhooks, and API clients for third-party integrations.
 *
 * @example GitHub
 * ```ts
 * import { createGitHubOAuth, createGitHubWebhookHandler, createGitHubClient } from "@repo/integrations/github";
 *
 * // OAuth
 * const github = createGitHubOAuth({ clientId, clientSecret, redirectUri });
 * const { url, state } = github.getAuthorizationUrl({ scopes: ["user:email"] });
 *
 * // Webhooks
 * const handler = createGitHubWebhookHandler(secret, {
 *   push: (event) => console.log("Push:", event.ref),
 * });
 *
 * // API
 * const client = createGitHubClient(accessToken);
 * const repos = await client.repos.list();
 * ```
 *
 * @example Slack
 * ```ts
 * import { createSlackOAuth, createSlackEventHandler, createSlackClient } from "@repo/integrations/slack";
 *
 * // OAuth
 * const slack = createSlackOAuth({ clientId, clientSecret, redirectUri });
 * const { url, state } = slack.getAuthorizationUrl({ scopes: ["chat:write"] });
 *
 * // Events
 * const handler = createSlackEventHandler(signingSecret, {
 *   message: (event) => console.log("Message:", event.text),
 * });
 *
 * // API
 * const client = createSlackClient(accessToken);
 * await client.chat.postMessage({ channel: "C123", text: "Hello!" });
 * ```
 *
 * @example Discord
 * ```ts
 * import { createDiscordOAuth, createDiscordInteractionHandler, createDiscordClient } from "@repo/integrations/discord";
 *
 * // OAuth
 * const discord = createDiscordOAuth({ clientId, clientSecret, redirectUri });
 * const { url, state } = discord.getAuthorizationUrl({ scopes: ["identify", "guilds"] });
 *
 * // Interactions
 * const handler = createDiscordInteractionHandler(publicKey, {
 *   applicationCommand: (interaction) => responses.message("Hello!"),
 * });
 *
 * // API
 * const client = createDiscordClient({ botToken });
 * await client.channels.createMessage(channelId, { content: "Hello!" });
 * ```
 */

export {
	type ApplicationCommand,
	type ApplicationCommandOption,
	COMMAND_OPTION_TYPES,
	type CreateMessageOptions,
	command,
	createDiscordClient,
	type DiscordClient,
	type DiscordGuild,
	type EditMessageOptions,
	option,
} from "./discord/api";
// Discord
export {
	calculatePermissions,
	createDiscordOAuth,
	DISCORD_PERMISSIONS,
	DISCORD_SCOPES,
	type DiscordAuthorizationOptions,
	type DiscordConnection,
	type DiscordGuild as DiscordOAuthGuild,
	type DiscordOAuth,
	type DiscordOAuthConfig,
	type DiscordScope,
	type DiscordTokens,
	type DiscordUser as DiscordOAuthUser,
} from "./discord/oauth";
export {
	components,
	createDiscordInteractionHandler,
	type DiscordChannel,
	type DiscordComponent,
	type DiscordEmbed,
	type DiscordInteraction,
	type DiscordInteractionData,
	type DiscordInteractionHandlers,
	type DiscordInteractionResponse,
	type DiscordMember,
	type DiscordMessage,
	type DiscordRole,
	type DiscordWebhookMessage,
	deleteWebhookMessage,
	discordInteractions,
	editWebhookMessage,
	embed,
	executeWebhook,
	responses,
	verifyDiscordSignature,
} from "./discord/webhooks";

export {
	type CreateIssueOptions,
	type CreatePROptions,
	createGitHubClient,
	type GitHubClient,
	type GitHubIssue,
	type GitHubPullRequest,
	type GitHubRepo,
} from "./github/api";
// GitHub
export {
	createGitHubOAuth,
	GITHUB_SCOPES,
	type GitHubAuthorizationOptions,
	type GitHubEmail,
	type GitHubOAuth,
	type GitHubOAuthConfig,
	type GitHubScope,
	type GitHubUser,
} from "./github/oauth";
export {
	createGitHubWebhookHandler,
	GITHUB_CI_EVENTS,
	GITHUB_ISSUE_EVENTS,
	GITHUB_PR_EVENTS,
	GITHUB_REPO_EVENTS,
	type GitHubIssueCommentPayload,
	type GitHubIssuesPayload,
	type GitHubPullRequestPayload,
	type GitHubPushPayload,
	type GitHubReleasePayload,
	type GitHubWebhookEvent,
	type GitHubWebhookHandlers,
	type GitHubWebhookPayload,
	type GitHubWorkflowRunPayload,
	githubWebhook,
	verifyGitHubWebhook,
} from "./github/webhooks";
export {
	type CreateIssueInput as LinearCreateIssueInput,
	createLinearClient,
	LINEAR_PRIORITIES,
	type LinearClient,
	type LinearComment,
	type LinearIssue,
	type LinearProject,
	type LinearTeam,
	type LinearUser,
	type UpdateIssueInput as LinearUpdateIssueInput,
} from "./linear/api";
// Linear
export {
	createLinearOAuth,
	LINEAR_SCOPES,
	type LinearAuthorizationOptions,
	type LinearOAuth,
	type LinearOAuthConfig,
	type LinearOrganization,
	type LinearScope,
	type LinearUser as LinearOAuthUser,
} from "./linear/oauth";
export {
	createLinearWebhookHandler,
	type LinearComment as LinearWebhookComment,
	type LinearCycle,
	type LinearIssue as LinearWebhookIssue,
	type LinearProject as LinearWebhookProject,
	type LinearWebhookAction,
	type LinearWebhookHandlers,
	type LinearWebhookPayload,
	type LinearWebhookType,
	linearWebhook,
	verifyLinearWebhook,
} from "./linear/webhooks";
export {
	blocks as notionBlocks,
	type CreatePageInput,
	createNotionClient,
	type NotionBlock,
	type NotionClient,
	type NotionDatabase,
	type NotionFile,
	type NotionIcon,
	type NotionPage,
	type NotionParent,
	type NotionProperty,
	type NotionPropertySchema,
	type NotionRichText,
	type NotionUser,
	properties as notionProperties,
	type QueryDatabaseOptions,
	type SearchOptions as NotionSearchOptions,
	type UpdatePageInput,
} from "./notion/api";
// Notion
export {
	createNotionOAuth,
	type NotionAuthorizationOptions,
	type NotionOAuth,
	type NotionOAuthConfig,
	type NotionOwner,
	type NotionTokens,
	type NotionUser as NotionOAuthUser,
} from "./notion/oauth";
export {
	blocks,
	createSlackClient,
	elements,
	type PostMessageOptions,
	type SlackChannel,
	type SlackClient,
	type SlackMessage,
	type SlackUserInfo,
	type SlackView,
} from "./slack/api";
// Slack
export {
	createSlackOAuth,
	SLACK_BOT_SCOPES,
	SLACK_USER_SCOPES,
	type SlackAuthorizationOptions,
	type SlackBotScope,
	type SlackOAuth,
	type SlackOAuthConfig,
	type SlackTokens,
	type SlackUser,
	type SlackUserScope,
} from "./slack/oauth";
export {
	createSlackEventHandler,
	createSlackInteractiveHandler,
	createSlackSlashCommandHandler,
	type SlackAppMentionEvent,
	type SlackEventHandlers,
	type SlackEventType,
	type SlackInteractivePayload,
	type SlackMessageEvent,
	type SlackReactionEvent,
	type SlackSlashCommand,
	type SlackSlashCommandResponse,
	slackCommands,
	slackEvents,
	verifySlackRequest,
} from "./slack/webhooks";
// Types
export * from "./types";
