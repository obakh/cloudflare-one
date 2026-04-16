# Deployment Guide

Best practices for deploying Cloudflare Workers in this monorepo.

## Preview URLs

Preview URLs let you test new versions before deploying to production.

### Enable Preview URLs

Add to your `wrangler.jsonc`:

```jsonc
{
  "name": "my-app",
  "preview_urls": true
}
```

### Generate Preview URL

```bash
# Upload version and get preview URL
wrangler versions upload --config apps/web/wrangler.jsonc

# Output: Preview URL: https://abc123-my-app.username.workers.dev
```

### Aliased Preview URLs

Create persistent, readable preview URLs for branches:

```bash
# Create "staging" alias
wrangler versions upload --preview-alias staging --config apps/web/wrangler.jsonc

# Result: https://staging-my-app.username.workers.dev
```

Common aliases:
- `staging` - Pre-production testing
- `feature-xyz` - Feature branch testing
- `pr-123` - Pull request previews

### Secure Preview URLs

Preview URLs are public by default. To restrict access:

1. Go to Cloudflare Dashboard → Workers & Pages → Your Worker
2. Settings → Domains & Routes
3. Enable Cloudflare Access for Preview URLs
4. Configure allowed emails/domains

## Quick Commands

```bash
# Deploy all apps to production
pnpm deploy

# Deploy specific app
pnpm --filter @repo/web deploy
pnpm --filter @repo/blog deploy
pnpm --filter @repo/admin deploy

# Preview deployment (staging)
pnpm deploy:preview
```

## Deployment Strategies

### 1. Standard Deployment (Default)

Deploys immediately to 100% of traffic:

```bash
pnpm --filter @repo/web deploy
```

### 2. Gradual Rollout

For safer deployments, use versions and gradual deployments:

```bash
# Step 1: Upload new version (doesn't deploy yet)
pnpm --filter @repo/web versions:upload

# Step 2: Deploy gradually (interactive)
pnpm --filter @repo/web versions:deploy
```

The CLI will prompt you to choose traffic split (e.g., 10% new, 90% old).

### 3. Canary Deployment

Test on small percentage before full rollout:

```bash
# Upload version
wrangler versions upload --config apps/web/wrangler.jsonc

# Deploy to 10% of traffic
wrangler versions deploy --config apps/web/wrangler.jsonc
# Select: 10% new version, 90% previous version

# Monitor metrics, then increase to 50%
wrangler versions deploy --config apps/web/wrangler.jsonc
# Select: 50% new version, 50% previous version

# Full rollout
wrangler versions deploy --config apps/web/wrangler.jsonc
# Select: 100% new version
```

## Rollback

If something goes wrong:

```bash
# View recent deployments
wrangler deployments list --config apps/web/wrangler.jsonc

# Rollback to previous version
wrangler rollback --config apps/web/wrangler.jsonc
```

## Environment-Specific Deployments

### Production

```bash
pnpm deploy
```

Uses `wrangler.jsonc` configuration.

### Staging/Preview

```bash
pnpm deploy:preview
```

Uses `--env preview` flag. Requires `[env.preview]` section in `wrangler.jsonc`:

```jsonc
{
  "name": "my-app",
  // ... production config
  
  "env": {
    "preview": {
      "name": "my-app-preview",
      "vars": {
        "ENVIRONMENT": "staging"
      }
    }
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          
      - run: pnpm install
      
      - run: pnpm build
      
      - name: Deploy to Cloudflare
        run: pnpm deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Gradual Rollout in CI

For production safety, use gradual deployments:

```yaml
- name: Upload new version
  run: pnpm --filter @repo/web versions:upload
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

# Manual approval step, then:
- name: Deploy to 10%
  run: |
    wrangler versions deploy \
      --config apps/web/wrangler.jsonc \
      --percentage 10
```

## Secrets Management

### Set secrets via CLI

```bash
# Set secret for production
wrangler secret put RESEND_API_KEY --config apps/web/wrangler.jsonc

# Set secret for preview environment
wrangler secret put RESEND_API_KEY --config apps/web/wrangler.jsonc --env preview
```

### Bulk secrets from .dev.vars

```bash
# Deploy secrets from local file (careful!)
cat apps/web/.dev.vars | while read line; do
  key=$(echo $line | cut -d= -f1)
  value=$(echo $line | cut -d= -f2-)
  echo $value | wrangler secret put $key --config apps/web/wrangler.jsonc
done
```

## Monitoring Deployments

### View deployment status

```bash
# List recent deployments
wrangler deployments list --config apps/web/wrangler.jsonc

# View specific deployment
wrangler deployments status --config apps/web/wrangler.jsonc
```

### View versions

```bash
# List recent versions
wrangler versions list --config apps/web/wrangler.jsonc

# View version details
wrangler versions view <version-id> --config apps/web/wrangler.jsonc
```

## Best Practices

1. **Always test locally first**
   ```bash
   pnpm dev
   pnpm test
   ```

2. **Use preview environments** for staging

3. **Gradual rollouts** for production changes

4. **Monitor after deployment** - check Cloudflare dashboard for errors

5. **Keep secrets in Cloudflare** - never commit `.dev.vars`

6. **Version your wrangler config** - track changes in git

7. **Use deployment messages** for tracking:
   ```bash
   wrangler deploy --message "Fix: login redirect issue"
   ```

## Troubleshooting

### Deployment fails

```bash
# Check build output
pnpm --filter @repo/web build

# Dry run deployment
wrangler deploy --dry-run --config apps/web/wrangler.jsonc
```

### Version upload fails

- First deployment must use `wrangler deploy`, not `versions upload`
- Durable Object migrations require `wrangler deploy`
- Must use ES modules format (not service worker syntax)

### Rollback not working

```bash
# List versions to find the one you want
wrangler versions list --config apps/web/wrangler.jsonc

# Deploy specific version
wrangler versions deploy <version-id> --config apps/web/wrangler.jsonc
```

## References

- [Cloudflare Versions & Deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/)
- [Gradual Deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/)
- [Wrangler Commands](https://developers.cloudflare.com/workers/wrangler/commands/)
