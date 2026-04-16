# Cron Triggers

Schedule recurring tasks using Cloudflare Workers Cron Triggers.

## Quick Setup

### 1. Configure wrangler.jsonc

```jsonc
{
  "name": "my-worker",
  "triggers": {
    "crons": ["0 * * * *", "0 0 * * *"]
  }
}
```

### 2. Add scheduled handler

```ts
import { createCronScheduler, CRON_PATTERNS } from "@repo/scheduling/cron";

interface Env {
  DB: Hyperdrive;
}

const scheduler = createCronScheduler<Env>({
  [CRON_PATTERNS.EVERY_HOUR]: async (env) => {
    console.log("Hourly job running...");
    // Your hourly task
  },
  [CRON_PATTERNS.DAILY_MIDNIGHT]: async (env) => {
    console.log("Daily cleanup running...");
    // Your daily task
  },
});

export default {
  async fetch(request: Request, env: Env) {
    return new Response("OK");
  },
  scheduled: scheduler.handle,
};
```

## Cron Syntax

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
```

### Common Patterns

| Pattern | Description |
|---------|-------------|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `*/15 * * * *` | Every 15 minutes |
| `*/30 * * * *` | Every 30 minutes |
| `0 * * * *` | Every hour |
| `0 */6 * * *` | Every 6 hours |
| `0 */12 * * *` | Every 12 hours |
| `0 0 * * *` | Daily at midnight UTC |
| `0 12 * * *` | Daily at noon UTC |
| `0 0 * * 0` | Weekly on Sunday |
| `0 0 * * 1` | Weekly on Monday |
| `0 0 1 * *` | Monthly on the 1st |

Use `CRON_PATTERNS` constants from `@repo/scheduling/cron` for type safety.

## Testing Locally

```bash
# Start dev server with cron testing enabled
wrangler dev --test-scheduled

# In another terminal, trigger the cron
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

## Multiple Jobs

### Parallel Execution

```ts
import { createCronScheduler, runParallelJobs, CRON_PATTERNS } from "@repo/scheduling/cron";

const scheduler = createCronScheduler<Env>({
  [CRON_PATTERNS.EVERY_HOUR]: (env, ctx) => runParallelJobs([
    () => syncUsers(env),
    () => syncProducts(env),
    () => updateCache(env),
  ]),
});
```

### Sequential Execution

```ts
import { runSequentialJobs } from "@repo/scheduling/cron";

const scheduler = createCronScheduler<Env>({
  [CRON_PATTERNS.DAILY_MIDNIGHT]: (env, ctx) => runSequentialJobs([
    () => backupDatabase(env),
    () => cleanupOldRecords(env),
    () => sendReport(env),
  ]),
});
```

## Use Cases

### Data Sync

```ts
[CRON_PATTERNS.EVERY_15_MINUTES]: async (env) => {
  const response = await fetch("https://api.example.com/data");
  const data = await response.json();
  await env.KV.put("cached-data", JSON.stringify(data));
}
```

### Cleanup Old Records

```ts
[CRON_PATTERNS.DAILY_MIDNIGHT]: async (env) => {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  await query(env.DB, "DELETE FROM logs WHERE created_at < $1", [thirtyDaysAgo]);
}
```

### Send Scheduled Reports

```ts
[CRON_PATTERNS.WEEKLY_MONDAY]: async (env) => {
  const stats = await generateWeeklyStats(env);
  await sendEmail(env, {
    to: "team@example.com",
    subject: "Weekly Report",
    html: renderReport(stats),
  });
}
```

### Health Checks

```ts
[CRON_PATTERNS.EVERY_5_MINUTES]: async (env) => {
  const services = ["api", "database", "cache"];
  
  for (const service of services) {
    const healthy = await checkHealth(service);
    if (!healthy) {
      await sendAlert(env, `${service} is down!`);
    }
  }
}
```

## Limits

- Minimum interval: 1 minute
- Maximum cron triggers per Worker: 3
- Execution time limit: Same as Worker limits (30s free, 15min paid)

## Best Practices

1. **Keep jobs idempotent** - Jobs may run multiple times
2. **Use `ctx.waitUntil()`** for non-critical async work
3. **Log job start/end** for debugging
4. **Handle errors gracefully** - One failure shouldn't stop other jobs
5. **Use KV/D1 for state** - Track last run time, prevent duplicates

## References

- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cron Syntax](https://developers.cloudflare.com/workers/configuration/cron-triggers/#supported-cron-expressions)
