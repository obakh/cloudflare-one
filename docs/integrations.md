# Integrations

OAuth, webhooks, and API clients for third-party services.

## Installation

```bash
pnpm add @repo/integrations
```

## GitHub

### OAuth

```ts
import { createGitHubOAuth, GITHUB_SCOPES } from "@repo/integrations/github";

const github = createGitHubOAuth({
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  redirectUri: "https://example.com/auth/github/callback",
});

// Start OAuth flow
app.get("/auth/github", (c) => {
  const { url, state } = github.getAuthorizationUrl({
    scopes: [GITHUB_SCOPES.USER_EMAIL, GITHUB_SCOPES.REPO],
  });
  // Store state in cookie/session
  return c.redirect(url);
});

// Handle callback
app.get("/auth/github/callback", async (c) => {
  const code = c.req.query("code");
  const tokens = await github.exchangeCode(code);
  const user = await github.getUser(tokens.accessToken);
  const emails = await github.getUserEmails(tokens.accessToken);
  // Create session, store tokens
});
```

### Webhooks

```ts
import { createGitHubWebhookHandler, githubWebhook } from "@repo/integrations/github";

// Standalone handler
const handler = createGitHubWebhookHandler(env.GITHUB_WEBHOOK_SECRET, {
  push: async (event) => {
    console.log("Push to", event.repository?.full_name);
    console.log("Commits:", event.commits.length);
  },
  pull_request: async (event) => {
    if (event.action === "opened") {
      console.log("PR opened:", event.pull_request.title);
    }
  },
  issues: async (event) => {
    console.log("Issue", event.action, event.issue.title);
  },
});

// Hono middleware
app.post("/webhooks/github", githubWebhook({
  secret: (c) => c.env.GITHUB_WEBHOOK_SECRET,
  handlers: {
    push: async (event) => { /* ... */ },
  },
}));
```

### API Client

```ts
import { createGitHubClient } from "@repo/integrations/github";

const github = createGitHubClient(accessToken);

// List repos
const repos = await github.repos.list({ per_page: 100 });

// Create issue
const issue = await github.issues.create("owner", "repo", {
  title: "Bug report",
  body: "Description...",
  labels: ["bug"],
});

// Create PR
const pr = await github.pulls.create("owner", "repo", {
  title: "Feature",
  head: "feature-branch",
  base: "main",
});

// Comment on issue/PR
await github.issues.createComment("owner", "repo", 123, "Thanks!");
```

## Slack

### OAuth

```ts
import { createSlackOAuth, SLACK_BOT_SCOPES, SLACK_USER_SCOPES } from "@repo/integrations/slack";

const slack = createSlackOAuth({
  clientId: env.SLACK_CLIENT_ID,
  clientSecret: env.SLACK_CLIENT_SECRET,
  redirectUri: "https://example.com/auth/slack/callback",
});

// Start OAuth flow
app.get("/auth/slack", (c) => {
  const { url, state } = slack.getAuthorizationUrl({
    scopes: [SLACK_BOT_SCOPES.CHAT_WRITE, SLACK_BOT_SCOPES.CHANNELS_READ],
    userScopes: [SLACK_USER_SCOPES.IDENTITY_BASIC, SLACK_USER_SCOPES.IDENTITY_EMAIL],
  });
  return c.redirect(url);
});

// Handle callback
app.get("/auth/slack/callback", async (c) => {
  const code = c.req.query("code");
  const tokens = await slack.exchangeCode(code);
  // tokens.team, tokens.authedUser, tokens.incomingWebhook
});
```

### Events & Commands

```ts
import {
  createSlackEventHandler,
  createSlackSlashCommandHandler,
  slackEvents,
} from "@repo/integrations/slack";

// Event handler
const eventHandler = createSlackEventHandler(env.SLACK_SIGNING_SECRET, {
  url_verification: (event) => ({ challenge: event.challenge }),
  message: async (event) => {
    if (!event.bot_id) {
      console.log("User message:", event.text);
    }
  },
  app_mention: async (event) => {
    console.log("Mentioned in", event.channel);
  },
  reaction_added: async (event) => {
    console.log("Reaction:", event.reaction);
  },
});

// Slash command handler
const commandHandler = createSlackSlashCommandHandler(env.SLACK_SIGNING_SECRET, {
  "/hello": async (command) => ({
    response_type: "in_channel",
    text: `Hello, ${command.user_name}!`,
  }),
  "/private": async (command) => ({
    response_type: "ephemeral",
    text: "Only you can see this",
  }),
});

// Hono middleware
app.post("/slack/events", slackEvents({
  secret: (c) => c.env.SLACK_SIGNING_SECRET,
  handlers: { /* ... */ },
}));
```

### API Client

```ts
import { createSlackClient, blocks, elements } from "@repo/integrations/slack";

const slack = createSlackClient(accessToken);

// Send message
await slack.chat.postMessage({
  channel: "C1234567890",
  text: "Hello!",
});

// Send with blocks
await slack.chat.postMessage({
  channel: "C1234567890",
  blocks: [
    blocks.header("Welcome!"),
    blocks.section("Here's some info"),
    blocks.divider(),
    blocks.actions([
      elements.button("Click me", "btn_click", { style: "primary" }),
      elements.staticSelect("select_option", [
        { text: "Option 1", value: "1" },
        { text: "Option 2", value: "2" },
      ]),
    ]),
  ],
});

// Open modal
await slack.views.open({
  trigger_id: triggerId,
  view: {
    type: "modal",
    callback_id: "my_modal",
    title: { type: "plain_text", text: "My Modal" },
    submit: { type: "plain_text", text: "Submit" },
    blocks: [
      blocks.input("Name", elements.plainTextInput("name_input"), "name_block"),
    ],
  },
});
```

## Discord

### OAuth

```ts
import { createDiscordOAuth, DISCORD_SCOPES, DISCORD_PERMISSIONS, calculatePermissions } from "@repo/integrations/discord";

const discord = createDiscordOAuth({
  clientId: env.DISCORD_CLIENT_ID,
  clientSecret: env.DISCORD_CLIENT_SECRET,
  redirectUri: "https://example.com/auth/discord/callback",
});

// User OAuth
app.get("/auth/discord", (c) => {
  const { url, state } = discord.getAuthorizationUrl({
    scopes: [DISCORD_SCOPES.IDENTIFY, DISCORD_SCOPES.EMAIL, DISCORD_SCOPES.GUILDS],
  });
  return c.redirect(url);
});

// Bot OAuth (add to server)
app.get("/auth/discord/bot", (c) => {
  const { url, state } = discord.getAuthorizationUrl({
    scopes: [DISCORD_SCOPES.BOT, DISCORD_SCOPES.APPLICATIONS_COMMANDS],
    permissions: calculatePermissions(
      DISCORD_PERMISSIONS.SEND_MESSAGES,
      DISCORD_PERMISSIONS.EMBED_LINKS,
      DISCORD_PERMISSIONS.USE_APPLICATION_COMMANDS
    ),
  });
  return c.redirect(url);
});

// Handle callback
app.get("/auth/discord/callback", async (c) => {
  const code = c.req.query("code");
  const tokens = await discord.exchangeCode(code);
  const user = await discord.getUser(tokens.accessToken);
  const guilds = await discord.getUserGuilds(tokens.accessToken);
});
```

### Interactions (Slash Commands)

```ts
import {
  createDiscordInteractionHandler,
  responses,
  components,
  embed,
} from "@repo/integrations/discord";

const handler = createDiscordInteractionHandler(env.DISCORD_PUBLIC_KEY, {
  ping: () => responses.pong(),

  applicationCommand: async (interaction) => {
    const { name, options } = interaction.data!;

    if (name === "hello") {
      return responses.message("Hello!", { ephemeral: true });
    }

    if (name === "info") {
      return responses.message("Here's some info", {
        embeds: [
          embed({
            title: "Information",
            description: "Some details here",
            color: 0x5865f2,
            fields: [
              { name: "Field 1", value: "Value 1", inline: true },
              { name: "Field 2", value: "Value 2", inline: true },
            ],
          }),
        ],
        components: [
          components.actionRow(
            components.button("btn_action", "Click Me", { style: 1 }),
            components.linkButton("https://example.com", "Visit Site"),
          ),
        ],
      });
    }

    if (name === "modal") {
      return responses.modal("my_modal", "Enter Details", [
        components.actionRow(
          components.textInput("name", "Your Name", { required: true }),
        ),
        components.actionRow(
          components.textInput("message", "Message", { style: 2, placeholder: "Enter message..." }),
        ),
      ]);
    }
  },

  messageComponent: async (interaction) => {
    const customId = interaction.data!.custom_id;

    if (customId === "btn_action") {
      return responses.update("Button clicked!");
    }
  },

  modalSubmit: async (interaction) => {
    const values = interaction.data!.components!;
    return responses.message("Form submitted!", { ephemeral: true });
  },

  autocomplete: async (interaction) => {
    const focused = interaction.data!.options?.find((o) => o.focused);
    return responses.autocomplete([
      { name: "Option 1", value: "1" },
      { name: "Option 2", value: "2" },
    ]);
  },
});
```

### API Client

```ts
import { createDiscordClient, command, option, COMMAND_OPTION_TYPES } from "@repo/integrations/discord";

const discord = createDiscordClient({ botToken: env.DISCORD_BOT_TOKEN });

// Send message
await discord.channels.createMessage(channelId, {
  content: "Hello!",
  embeds: [{ title: "Embed", description: "Content" }],
});

// Register commands
await discord.commands.bulkOverwriteGlobal(applicationId, [
  {
    name: "hello",
    description: "Say hello",
  },
  {
    name: "greet",
    description: "Greet someone",
    options: [
      option(COMMAND_OPTION_TYPES.USER, "user", "User to greet", { required: true }),
      option(COMMAND_OPTION_TYPES.STRING, "message", "Custom message"),
    ],
  },
]);

// DM a user
const dm = await discord.users.createDM(userId);
await discord.channels.createMessage(dm.id, { content: "Hello via DM!" });

// Manage guild members
await discord.guilds.addMemberRole(guildId, userId, roleId);
```

### Webhooks

```ts
import { executeWebhook, editWebhookMessage, deleteWebhookMessage } from "@repo/integrations/discord";

// Send webhook message
const message = await executeWebhook(webhookUrl, {
  content: "Hello from webhook!",
  username: "My Bot",
  avatar_url: "https://example.com/avatar.png",
  embeds: [{ title: "Webhook Embed" }],
}, { wait: true });

// Edit webhook message
await editWebhookMessage(webhookUrl, message.id, {
  content: "Updated content",
});

// Delete webhook message
await deleteWebhookMessage(webhookUrl, message.id);
```

## Linear

### OAuth

```ts
import { createLinearOAuth, LINEAR_SCOPES } from "@repo/integrations/linear";

const linear = createLinearOAuth({
  clientId: env.LINEAR_CLIENT_ID,
  clientSecret: env.LINEAR_CLIENT_SECRET,
  redirectUri: "https://example.com/auth/linear/callback",
});

// Start OAuth flow
app.get("/auth/linear", (c) => {
  const { url, state } = linear.getAuthorizationUrl({
    scopes: [LINEAR_SCOPES.READ, LINEAR_SCOPES.WRITE],
  });
  return c.redirect(url);
});

// Handle callback
app.get("/auth/linear/callback", async (c) => {
  const code = c.req.query("code");
  const tokens = await linear.exchangeCode(code);
  const user = await linear.getUser(tokens.accessToken);
  // user.organization.id, user.organization.name
});
```

### Webhooks

```ts
import { createLinearWebhookHandler } from "@repo/integrations/linear";

const handler = createLinearWebhookHandler(env.LINEAR_WEBHOOK_SECRET, {
  Issue: async (event) => {
    if (event.action === "create") {
      console.log("Issue created:", event.data.title);
      console.log("Team:", event.data.team.name);
    }
    if (event.action === "update") {
      console.log("Issue updated:", event.data.identifier);
    }
  },
  Comment: async (event) => {
    console.log("Comment:", event.action, event.data.body);
  },
  Project: async (event) => {
    console.log("Project:", event.action, event.data.name);
  },
});
```

### API Client (GraphQL)

```ts
import { createLinearClient, LINEAR_PRIORITIES } from "@repo/integrations/linear";

const linear = createLinearClient(accessToken);

// Get teams
const { nodes: teams } = await linear.teams.list();

// Get issues
const { nodes: issues } = await linear.issues.list({
  first: 50,
  filter: { state: { type: { eq: "started" } } },
});

// Create issue
const issue = await linear.issues.create({
  teamId: teams[0].id,
  title: "Bug: Login not working",
  description: "Users can't log in...",
  priority: LINEAR_PRIORITIES.HIGH,
  labelIds: ["bug-label-id"],
});

// Update issue
await linear.issues.update(issue.id, {
  stateId: "done-state-id",
});

// Add comment
await linear.issues.addComment(issue.id, "Fixed in PR #123");

// Custom GraphQL query
const data = await linear.graphql(`
  query {
    viewer {
      assignedIssues {
        nodes { id title }
      }
    }
  }
`);
```

## Notion

### OAuth

```ts
import { createNotionOAuth } from "@repo/integrations/notion";

const notion = createNotionOAuth({
  clientId: env.NOTION_CLIENT_ID,
  clientSecret: env.NOTION_CLIENT_SECRET,
  redirectUri: "https://example.com/auth/notion/callback",
});

// Start OAuth flow
app.get("/auth/notion", (c) => {
  const { url, state } = notion.getAuthorizationUrl();
  return c.redirect(url);
});

// Handle callback
app.get("/auth/notion/callback", async (c) => {
  const code = c.req.query("code");
  const tokens = await notion.exchangeCode(code);
  // tokens.workspaceId, tokens.workspaceName, tokens.botId
});
```

### API Client

```ts
import { createNotionClient, blocks, properties } from "@repo/integrations/notion";

const notion = createNotionClient(accessToken);

// Search
const results = await notion.search({
  query: "Meeting notes",
  filter: { property: "object", value: "page" },
});

// Get database
const db = await notion.databases.get(databaseId);

// Query database
const { results: pages } = await notion.databases.query(databaseId, {
  filter: {
    property: "Status",
    select: { equals: "Done" },
  },
  sorts: [{ property: "Created", direction: "descending" }],
});

// Create page in database
const page = await notion.pages.create({
  parent: { database_id: databaseId },
  properties: {
    Name: properties.title("New task"),
    Status: properties.select("To Do"),
    Priority: properties.select("High"),
    "Due Date": properties.date("2025-02-01"),
    Tags: properties.multiSelect(["feature", "urgent"]),
  },
});

// Create page with content
const pageWithContent = await notion.pages.create({
  parent: { page_id: parentPageId },
  properties: {
    title: properties.title("Meeting Notes"),
  },
  children: [
    blocks.heading1("Agenda"),
    blocks.bulletedListItem("Review Q4 goals"),
    blocks.bulletedListItem("Discuss roadmap"),
    blocks.divider(),
    blocks.heading2("Notes"),
    blocks.paragraph("Key discussion points..."),
    blocks.callout("Action item: Follow up with team", "📌"),
    blocks.code("const x = 1;", "typescript"),
  ],
});

// Append blocks to page
await notion.blocks.append(pageId, [
  blocks.paragraph("Additional notes..."),
  blocks.toDo("Review PR", false),
  blocks.toDo("Update docs", true),
]);

// Update page
await notion.pages.update(pageId, {
  properties: {
    Status: properties.select("In Progress"),
  },
});
```

## Environment Variables

```env
# GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

# Slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_PUBLIC_KEY=
DISCORD_BOT_TOKEN=

# Linear
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
LINEAR_WEBHOOK_SECRET=

# Notion
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
```
