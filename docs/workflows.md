# Cloudflare Workflows

Durable, multi-step workflow execution with automatic retries and state persistence.

## Setup

### 1. Define a Workflow

```ts
// src/workflows/order-processing.ts
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import { createWorkflowHelpers, RetryPresets } from "@repo/workflows";

interface OrderParams {
  orderId: string;
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export class OrderWorkflow extends WorkflowEntrypoint<Env, OrderParams> {
  async run(event: WorkflowEvent<OrderParams>, step: WorkflowStep) {
    const helpers = createWorkflowHelpers(step);
    const { orderId, userId, items } = event.payload;

    // Step 1: Validate inventory
    const inventory = await helpers.retry(
      "validate-inventory",
      async () => {
        const response = await fetch(`${this.env.INVENTORY_API}/check`, {
          method: "POST",
          body: JSON.stringify({ items }),
        });
        if (!response.ok) throw new Error("Inventory check failed");
        return response.json();
      },
      RetryPresets.standard
    );

    // Step 2: Process payment
    const payment = await helpers.retry(
      "process-payment",
      async () => {
        const response = await fetch(`${this.env.PAYMENT_API}/charge`, {
          method: "POST",
          body: JSON.stringify({ orderId, userId }),
        });
        if (!response.ok) throw new Error("Payment failed");
        return response.json();
      },
      RetryPresets.aggressive
    );

    // Step 3: Wait for fulfillment
    await helpers.sleep("wait-for-fulfillment", "5 minutes");

    // Step 4: Send confirmation
    await helpers.retry(
      "send-confirmation",
      async () => {
        await fetch(`${this.env.EMAIL_API}/send`, {
          method: "POST",
          body: JSON.stringify({
            to: userId,
            template: "order-confirmation",
            data: { orderId, payment },
          }),
        });
      },
      RetryPresets.patient
    );

    return { orderId, status: "completed", paymentId: payment.id };
  }
}
```

### 2. Configure wrangler.toml

```toml
[[workflows]]
name = "order-workflow"
binding = "ORDER_WORKFLOW"
class_name = "OrderWorkflow"
```

### 3. Trigger the Workflow

```ts
// src/index.ts
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === "/orders" && request.method === "POST") {
      const body = await request.json();

      // Create workflow instance
      const instance = await env.ORDER_WORKFLOW.create({
        params: {
          orderId: crypto.randomUUID(),
          userId: body.userId,
          items: body.items,
        },
      });

      return Response.json({
        workflowId: instance.id,
        status: "started",
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
```

## Workflow Helpers

The `createWorkflowHelpers` function provides convenient wrappers:

```ts
const helpers = createWorkflowHelpers(step);

// Fetch JSON with automatic parsing
const data = await helpers.fetchJson<User[]>("get-users", "https://api.example.com/users");

// Fetch text
const html = await helpers.fetchText("get-page", "https://example.com");

// Sleep for a duration
await helpers.sleep("wait", "5 minutes");

// Retry with options
await helpers.retry("send-email", () => sendEmail(data), {
  limit: 5,
  delay: "10 seconds",
  backoff: "exponential",
});

// Run steps in parallel
const [users, posts] = await helpers.parallel([
  ["fetch-users", () => fetchUsers()],
  ["fetch-posts", () => fetchPosts()],
]);

// Try with fallback
const config = await helpers.tryStep(
  "load-config",
  () => fetchConfig(),
  defaultConfig
);

// Conditional step
await helpers.when(shouldNotify, "notify", () => sendNotification());

// Sequential steps with accumulator
const result = await helpers.sequence([
  ["step-1", () => fetchData()],
  ["step-2", (prev) => processData(prev)],
  ["step-3", (prev) => saveData(prev)],
]);
```

## Retry Presets

```ts
import { RetryPresets } from "@repo/workflows";

// Quick retries for transient failures
RetryPresets.fast      // 3 retries, 1s delay, exponential, 1min timeout

// Standard retry for API calls
RetryPresets.standard  // 5 retries, 5s delay, exponential, 15min timeout

// Patient retry for rate-limited APIs
RetryPresets.patient   // 10 retries, 30s delay, linear, 1hr timeout

// Aggressive retry for critical operations
RetryPresets.aggressive // 20 retries, 1s delay, exponential, 30min timeout
```

## Sleep Durations

```ts
import { SleepDurations } from "@repo/workflows";

await helpers.sleep("wait", SleepDurations.brief);   // 10 seconds
await helpers.sleep("wait", SleepDurations.short);   // 1 minute
await helpers.sleep("wait", SleepDurations.medium);  // 5 minutes
await helpers.sleep("wait", SleepDurations.long);    // 30 minutes
await helpers.sleep("wait", SleepDurations.hour);    // 1 hour
await helpers.sleep("wait", SleepDurations.day);     // 1 day
```

## Managing Workflow Instances

```ts
import {
  createWorkflowInstance,
  getWorkflowStatus,
  waitForWorkflow,
} from "@repo/workflows";

// Create with custom ID
const instance = await createWorkflowInstance(
  env.MY_WORKFLOW,
  { userId: "123" },
  "custom-instance-id"
);

// Check status
const status = await getWorkflowStatus(env.MY_WORKFLOW, instance.id);
console.log(status.status); // "running" | "complete" | "errored" | etc.

// Wait for completion
const result = await waitForWorkflow(env.MY_WORKFLOW, instance.id, {
  pollInterval: 2000,  // Check every 2 seconds
  timeout: 60000,      // Timeout after 1 minute
});
```

## Workflow Instance Control

```ts
// Get instance
const instance = await env.MY_WORKFLOW.get("instance-id");

// Pause execution
await instance.pause();

// Resume execution
await instance.resume();

// Terminate workflow
await instance.terminate();

// Restart from beginning
await instance.restart();
```

## Error Handling

```ts
export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const helpers = createWorkflowHelpers(step);

    try {
      await helpers.retry("critical-step", () => criticalOperation(), {
        limit: 10,
        delay: "5 seconds",
        backoff: "exponential",
      });
    } catch (error) {
      // Log error and continue with fallback
      await step.do("log-error", async () => {
        await logError(error);
      });

      // Use fallback value
      return { status: "partial", error: error.message };
    }

    return { status: "success" };
  }
}
```

## Best Practices

1. **Idempotent Steps**: Each step should be idempotent since it may be retried
2. **Meaningful Names**: Use descriptive step names for debugging
3. **Appropriate Timeouts**: Set timeouts based on expected operation duration
4. **Error Boundaries**: Use `tryStep` for non-critical operations
5. **State Persistence**: Workflows automatically persist state between steps

## Pricing

- Workflows are billed per CPU time used
- Steps that sleep don't consume CPU time
- State persistence is included
- See [Cloudflare Workflows Pricing](https://developers.cloudflare.com/workflows/platform/pricing/)
