# Cloudflare Queues

Message queues for async job processing with guaranteed delivery.

## Quick Setup

### 1. Create a Queue

```bash
wrangler queues create my-queue
```

### 2. Configure wrangler.jsonc

```jsonc
{
  "name": "my-worker",
  "queues": {
    "producers": [
      { "binding": "MY_QUEUE", "queue": "my-queue" }
    ],
    "consumers": [
      {
        "queue": "my-queue",
        "max_batch_size": 10,
        "max_batch_timeout": 30,
        "max_retries": 3,
        "dead_letter_queue": "my-dlq"
      }
    ]
  }
}
```

### 3. Producer (Send Messages)

```ts
import { createQueueProducer } from "@repo/notifications/queues";

interface Jobs {
  "email:send": { to: string; subject: string; html: string };
  "report:generate": { reportId: string };
}

const jobs = createQueueProducer<Jobs>(env.MY_QUEUE);

// Send job
await jobs.send("email:send", {
  to: "user@example.com",
  subject: "Hello",
  html: "<p>Hi!</p>",
});

// Send with delay
await jobs.sendDelayed("report:generate", { reportId: "123" }, 60);
```

### 4. Consumer (Process Messages)

```ts
import { createQueueConsumer } from "@repo/notifications/queues";

const consumer = createQueueConsumer<Jobs, Env>({
  "email:send": async (payload, message, env) => {
    await sendEmail(env, payload.to, payload.subject, payload.html);
    // message.ack() called automatically on success
  },
  "report:generate": async (payload, message, env) => {
    await generateReport(env, payload.reportId);
  },
});

export default {
  async fetch(request, env) {
    // Handle HTTP requests
  },
  async queue(batch, env, ctx) {
    await consumer.process(batch, env);
  },
};
```

## Limits

| Feature | Limit |
|---------|-------|
| Queues per account | 10,000 |
| Message size | 128 KB |
| Messages per batch | 100 |
| Throughput | 5,000 msg/sec |
| Retention | 4-14 days |
| Max delay | 12 hours |
| Consumer duration | 15 minutes |

## Configuration Options

### Producer Binding

```jsonc
{
  "queues": {
    "producers": [
      {
        "binding": "MY_QUEUE",      // Variable name in Worker
        "queue": "my-queue",        // Queue name
        "delivery_delay": 60        // Optional: default delay (seconds)
      }
    ]
  }
}
```

### Consumer Binding

```jsonc
{
  "queues": {
    "consumers": [
      {
        "queue": "my-queue",
        "max_batch_size": 10,           // 1-100 messages
        "max_batch_timeout": 30,        // 0-60 seconds
        "max_retries": 3,               // 0-100 retries
        "dead_letter_queue": "my-dlq",  // Failed messages go here
        "max_concurrency": 10           // Parallel consumers
      }
    ]
  }
}
```

## Dead Letter Queues

Messages that fail after max retries go to the DLQ:

```bash
# Create DLQ
wrangler queues create my-dlq

# Configure in wrangler.jsonc
{
  "queues": {
    "consumers": [
      {
        "queue": "my-queue",
        "max_retries": 3,
        "dead_letter_queue": "my-dlq"
      }
    ]
  }
}
```

Process DLQ separately:

```ts
export default {
  async queue(batch, env) {
    if (batch.queue === "my-dlq") {
      // Handle failed messages
      for (const msg of batch.messages) {
        console.error("Failed message:", msg.body);
        await notifyAdmin(msg);
        msg.ack();
      }
    }
  },
};
```

## Batching

Send multiple messages efficiently:

```ts
const jobs = createQueueProducer<Jobs>(env.MY_QUEUE);

// Send batch (max 100 messages or 256KB)
await jobs.sendBatch([
  { type: "email:send", payload: { to: "user1@example.com", ... } },
  { type: "email:send", payload: { to: "user2@example.com", ... } },
  { type: "email:send", payload: { to: "user3@example.com", ... } },
]);
```

## Delays

Delay message delivery:

```ts
import { DELAYS } from "@repo/notifications/queues";

// Send with 5 minute delay
await jobs.sendDelayed("report:generate", { reportId: "123" }, DELAYS.FIVE_MINUTES);

// Retry with exponential backoff
message.retry({ delaySeconds: 5 * message.attempts });
```

Available delay constants:
- `DELAYS.IMMEDIATE` - 1 second
- `DELAYS.SHORT` - 5 seconds
- `DELAYS.MEDIUM` - 30 seconds
- `DELAYS.ONE_MINUTE` - 60 seconds
- `DELAYS.FIVE_MINUTES` - 300 seconds
- `DELAYS.ONE_HOUR` - 3600 seconds
- `DELAYS.MAX_DELAY` - 43200 seconds (12 hours)

## Event Subscriptions

Subscribe to Cloudflare product events:

```jsonc
{
  "queues": {
    "consumers": [
      {
        "queue": "my-events",
        "type": "r2_bucket",           // Event source
        "bucket_name": "my-bucket",
        "event_types": ["object-create", "object-delete"]
      }
    ]
  }
}
```

Supported event sources:
- R2 buckets (object-create, object-delete)
- Workers AI (batch completion)
- More coming...

## Pull Consumers

Consume messages over HTTP (for external services):

```bash
# Enable pull consumer
wrangler queues consumer http add my-queue

# Pull messages
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/queues/{queue_id}/messages/pull" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  -d '{"visibility_timeout": 30, "batch_size": 10}'
```

## Testing Locally

```bash
# Start dev server
wrangler dev

# Send test message
curl -X POST http://localhost:8787/send \
  -H "Content-Type: application/json" \
  -d '{"type": "email:send", "payload": {"to": "test@example.com"}}'
```

## Use Cases

### Email Queue

```ts
interface EmailJobs {
  "email:send": { to: string; subject: string; html: string };
  "email:bulk": { recipients: string[]; template: string };
}

const emailQueue = createQueueProducer<EmailJobs>(env.EMAIL_QUEUE);

// Queue email instead of sending synchronously
await emailQueue.send("email:send", {
  to: user.email,
  subject: "Welcome!",
  html: welcomeTemplate(user.name),
});
```

### Background Processing

```ts
interface ProcessingJobs {
  "image:resize": { imageId: string; sizes: number[] };
  "video:transcode": { videoId: string; format: string };
  "pdf:generate": { documentId: string };
}

// Offload heavy work
await jobs.send("image:resize", {
  imageId: "abc123",
  sizes: [100, 200, 400, 800],
});
```

### Webhook Delivery

```ts
interface WebhookJobs {
  "webhook:deliver": { url: string; payload: unknown; retries: number };
}

const consumer = createQueueConsumer<WebhookJobs, Env>({
  "webhook:deliver": async (payload, message, env) => {
    const response = await fetch(payload.url, {
      method: "POST",
      body: JSON.stringify(payload.payload),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  },
});
```

## Best Practices

1. **Keep messages small** - Store large data in R2, pass reference in message
2. **Use dead letter queues** - Don't lose failed messages
3. **Idempotent handlers** - Messages may be delivered more than once
4. **Batch when possible** - More efficient than individual sends
5. **Set appropriate timeouts** - Balance latency vs batching efficiency
6. **Monitor DLQ** - Alert on failed messages

## References

- [Cloudflare Queues Docs](https://developers.cloudflare.com/queues/)
- [JavaScript APIs](https://developers.cloudflare.com/queues/configuration/javascript-apis/)
- [Limits](https://developers.cloudflare.com/queues/platform/limits/)
