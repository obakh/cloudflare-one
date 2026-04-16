/**
 * Discord Integration
 *
 * OAuth, webhooks/interactions, and API client for Discord.
 */

export {
	type ApplicationCommand,
	type ApplicationCommandOption,
	COMMAND_OPTION_TYPES,
	type CreateMessageOptions,
	command,
	createDiscordClient,
	type DiscordClient,
	type DiscordClientConfig,
	type DiscordGuild,
	type EditMessageOptions,
	option,
} from "./api";
export * from "./oauth";
export {
	components,
	createDiscordInteractionHandler,
	type DiscordChannel,
	type DiscordCommandOption,
	type DiscordComponent,
	type DiscordEmbed,
	type DiscordInteraction,
	type DiscordInteractionData,
	type DiscordInteractionHandlers,
	type DiscordInteractionResponse,
	type DiscordInteractionResponseType,
	// Types
	type DiscordInteractionType,
	type DiscordMember,
	type DiscordMessage,
	type DiscordRole,
	type DiscordWebhookMessage,
	deleteWebhookMessage,
	discordInteractions,
	editWebhookMessage,
	embed,
	executeWebhook,
	type InteractionHandler,
	responses,
	// Functions
	verifyDiscordSignature,
} from "./webhooks";
