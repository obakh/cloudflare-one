# Workers Builds Notifications

Get notified when your Workers builds complete, fail, or are cancelled. Uses Queue Event Subscriptions to consume Workers Builds events and forward them to Slack, Discord, or custom webhooks.

## Setup

### 1. Create a Queue

```bash
npx wrangler queues create builds-event-subscriptions
```

### 2. Create a Worker

```ts
// src/index.ts
import { createBuildEventsConsumer, type BuildEvent } from "@repo/notifications/build-events";

interface Env {
  CLOUDFLARE_API_TOKEN: string;
  SLACK_WEBHOOK_URL: string;
}

export default {
  async queue(batch: MessageBatch<BuildEvent>, env: Env) {
    const consumer = createBuildEventsConsumer({
      apiToken: env.CLOUDFLARE_API_TOKEN,
      slackWebhookUrl: env.SLACK_WEBHOOK_URL,
    });
    await consumer.process(batch);
  },
};
```

### 3. Configure wrangler.toml

```toml
name = "build-notifications"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[queues]
consumers = [
  { queue = "builds-event-subscriptions", max_batch_size = 10, max_batch_timeout = 30 }
]
```

### 4. Set Secrets

```bash
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put SLACK_WEBHOOK_URL
```

### 5. Deploy & Subscribe

```bash
wrangler deploy

# Subscribe to build events
wrangler queues subscription create builds-event-subscriptions \
  --source workersBuilds.worker \
  --events build.succeeded,build.failed \
  --worker-name build-notifications
```

## API Reference

### `handleBuildEvent(event, options)`

Process a build event and return notification data.

```ts
import { handleBuildEvent, type BuildEvent } from "@repo/notifications/build-events";

const notification = await handleBuildEvent(event, {
  apiToken: env.CLOUDFLARE_API_TOKEN,
  productionBranches: ["main", "master"], // optional
});

if (notification) {
  console.log(notification.status); // "success" | "failure" | "cancelled"
  console.log(notification.workerName);
  console.log(notification.previewUrl);
  console.log(notification.error);
}
```

### `buildSlackPayload(notification)`

Convert notification to Slack Block Kit format.

```ts
import { buildSlackPayload } from "@repo/notifications/build-events";

const payload = buildSlackPayload(notification);
// { blocks: [...] }
```

### `sendSlackNotification(webhookUrl, payload)`

Send to Slack webhook.

```ts
import { sendSlackNotification } from "@repo/notifications/build-events";

await sendSlackNotification(env.SLACK_WEBHOOK_URL, payload);
```

### `sendDiscordNotification(webhookUrl, payload)`

Send to Discord webhook (auto-appends `/slack` for compatibility).

```ts
import { sendDiscordNotification } from "@repo/notifications/build-events";

await sendDiscordNotification(env.DISCORD_WEBHOOK_URL, payload);
```

### `createBuildEventsConsumer(options)`

Create a complete queue consumer.

```ts
import { createBuildEventsConsumer } from "@repo/notifications/build-events";

const consumer = createBuildEventsConsumer({
  apiToken: env.CLOUDFLARE_API_TOKEN,
  slackWebhookUrl: env.SLACK_WEBHOOK_URL,
  discordWebhookUrl: env.DISCORD_WEBHOOK_URL,
  onNotification: async (notification) => {
    // Custom handling
  },
});

export default {
  async queue(batch, env) {
    await consumer.process(batch);
  },
};
```

## Custom Webhook

For custom webhooks, use the lower-level APIs:

```ts
import {
  handleBuildEvent,
  type BuildEvent,
  type BuildNotification,
} from "@repo/notifications/build-events";

async function sendToCustomWebhook(notification: BuildNotification) {
  await fetch("https://your-webhook.com/builds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: notification.status,
      worker: notification.workerName,
      branch: notification.branch,
      commit: notification.commitHash,
      url: notification.previewUrl || notification.liveUrl,
      error: notification.error,
    }),
  });
}

export default {
  async queue(batch: MessageBatch<BuildEvent>, env: Env) {
    for (const msg of batch.messages) {
      const notification = await handleBuildEvent(msg.body, {
        apiToken: env.CLOUDFLARE_API_TOKEN,
      });
      if (notification) {
        await sendToCustomWebhook(notification);
      }
      msg.ack();
    }
  },
};
```

## Webhook Setup

### Slack

1. Go to [Slack Apps](https://api.slack.com/apps) → Create New App → From scratch
2. Go to Incoming Webhooks → Toggle On
3. Add New Webhook to Workspace → Select channel
4. Copy webhook URL

### Discord

1. Server Settings → Integrations → Webhooks → New Webhook
2. Select channel and copy URL
3. The library auto-appends `/slack` for Slack-compatible payloads

## Event Types

| Event | Notification |
|-------|--------------|
| `build.succeeded` (production) | ✅ Live Worker URL |
| `build.succeeded` (preview) | ✅ Preview URL |
| `build.failed` | ❌ Error message |
| `build.cancelled` | ⚠️ Cancellation note |
| `build.started` / `build.queued` | Skipped (no notification) |

## Required API Token Permissions

- Workers Builds Configuration: Read
- Workers Scripts: Read

## Helper Functions

```ts
import {
  getBuildStatus,
  isProductionBranch,
  extractAuthorName,
  getCommitUrl,
  getDashboardUrl,
  extractBuildError,
  shouldSkipEvent,
} from "@repo/notifications/build-events";

// Check build status
const status = getBuildStatus(event);
// { isSucceeded: boolean, isFailed: boolean, isCancelled: boolean }

// Check if production branch
isProductionBranch("main"); // true
isProductionBranch("feature/foo"); // false

// Extract author from email
extractAuthorName("john.doe@example.com"); // "john.doe"

// Get commit URL (GitHub/GitLab)
getCommitUrl(event); // "https://github.com/org/repo/commit/abc123"

// Get dashboard URL
getDashboardUrl(event); // "https://dash.cloudflare.com/..."

// Extract error from logs
extractBuildError(logs); // "Error: Module not found..."
```
