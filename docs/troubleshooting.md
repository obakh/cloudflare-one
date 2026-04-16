# Troubleshooting Guide

Common issues and solutions for development and deployment.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Issues](#development-issues)
- [Build Issues](#build-issues)
- [Database Issues](#database-issues)
- [Deployment Issues](#deployment-issues)
- [Testing Issues](#testing-issues)
- [Git Hooks Issues](#git-hooks-issues)

## Installation Issues

### pnpm install fails

**Problem:** `pnpm install` fails with dependency resolution errors

**Solutions:**
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# If still failing, check Node.js version
node --version  # Should be >= 20.16.0
```

### Wrong Node.js version

**Problem:** `Error: The engine "node" is incompatible`

**Solution:**
```bash
# Install correct Node.js version
nvm install 20.16.0
nvm use 20.16.0

# Or use the version in .nvmrc if you have one
nvm use
```

### pnpm not found

**Problem:** `pnpm: command not found`

**Solution:**
```bash
# Enable corepack (comes with Node.js 16.13+)
corepack enable

# Or install pnpm globally
npm install -g pnpm@9.15.0
```

## Development Issues

### Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5173`

**Solutions:**
```bash
# Find process using the port (Linux/Mac)
lsof -i :5173

# Find process using the port (Windows)
netstat -ano | findstr :5173

# Kill the process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Or use a different port
PORT=5174 pnpm --filter @repo/web dev
```

### Hot reload not working

**Problem:** Changes not reflecting in browser

**Solutions:**
1. Check if the file is in the correct location
2. Restart the dev server
3. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
4. Check if file is being watched:
   ```bash
   # Increase file watchers (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Module not found errors

**Problem:** `Cannot find module '@repo/ui'`

**Solutions:**
```bash
# Rebuild packages
pnpm build

# Check if package is in workspace
pnpm list @repo/ui

# Verify package.json exports
cat packages/ui/package.json | grep exports
```

### TypeScript errors in IDE

**Problem:** VS Code showing TypeScript errors that don't exist

**Solutions:**
1. Restart TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Rebuild packages: `pnpm build`
3. Delete `.turbo` cache: `rm -rf .turbo`
4. Check TypeScript version: Should use workspace version

## Build Issues

### Turborepo cache issues

**Problem:** Build using stale cache

**Solutions:**
```bash
# Clear Turborepo cache
rm -rf .turbo

# Force rebuild without cache
pnpm build --force

# Or disable cache temporarily
TURBO_FORCE=true pnpm build
```

### Out of memory during build

**Problem:** `JavaScript heap out of memory`

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

# Or add to package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' turbo build"
```

### Build fails on specific package

**Problem:** One package fails to build

**Solutions:**
```bash
# Build specific package with verbose output
pnpm --filter @repo/problematic-package build --verbose

# Check for circular dependencies
pnpm list --depth=Infinity | grep -A 5 "circular"

# Clean and rebuild
pnpm --filter @repo/problematic-package clean
pnpm --filter @repo/problematic-package build
```

## Database Issues

### Cannot connect to PostgreSQL

**Problem:** `Connection refused` or `ECONNREFUSED`

**Solutions:**
```bash
# Check if Docker container is running
docker ps

# Start PostgreSQL
docker compose -f apps/web/docker-compose.yml up -d

# Check logs
docker compose -f apps/web/docker-compose.yml logs

# Verify connection string in .dev.vars
cat apps/web/.dev.vars | grep DATABASE_URL
```

### Migration fails

**Problem:** Drizzle migration errors

**Solutions:**
```bash
# Check current schema
cd packages/auth
pnpm db:studio

# Generate new migration
pnpm db:generate

# Push schema directly (dev only)
pnpm db:push

# If migration is stuck, check PostgreSQL logs
docker compose -f apps/web/docker-compose.yml logs postgres
```

### Database schema out of sync

**Problem:** `relation does not exist` errors

**Solutions:**
```bash
# Reset database (WARNING: deletes all data)
docker compose -f apps/web/docker-compose.yml down -v
docker compose -f apps/web/docker-compose.yml up -d

# Run migrations
cd packages/auth
pnpm db:push

# Or run SQL directly
psql -f packages/auth/drizzle/0000_auth_tables.sql postgresql://myuser:mypassword@localhost:5432/mydatabase
```

## Deployment Issues

### Wrangler deployment fails

**Problem:** `Error: Failed to publish`

**Solutions:**
```bash
# Check Wrangler authentication
wrangler whoami

# Login again
wrangler login

# Verify wrangler.jsonc syntax
cat apps/web/wrangler.jsonc

# Deploy with verbose output
wrangler deploy --config apps/web/wrangler.jsonc --verbose
```

### Environment variables not working

**Problem:** `undefined` values in production

**Solutions:**
1. Check if secrets are set in Cloudflare dashboard
2. Set secrets via CLI:
   ```bash
   echo "value" | wrangler secret put SECRET_NAME --config apps/web/wrangler.jsonc
   ```
3. Verify binding names match wrangler.jsonc
4. Check if using `env.VARIABLE` not `process.env.VARIABLE`

### Build succeeds but deployment fails

**Problem:** Build works locally but fails in CI

**Solutions:**
```bash
# Check CI logs for specific error
# Common issues:
# 1. Missing environment variables in GitHub secrets
# 2. Cloudflare API token expired
# 3. Account ID mismatch

# Test deployment locally
pnpm build
wrangler deploy --config apps/web/wrangler.jsonc --dry-run
```

### Worker exceeds size limit

**Problem:** `Error: Script too large`

**Solutions:**
1. Check bundle size: `du -h apps/web/build`
2. Remove unused dependencies
3. Use dynamic imports for large modules
4. Enable minification in build config
5. Check for accidentally bundled files

## Testing Issues

### Playwright tests fail

**Problem:** E2E tests timing out or failing

**Solutions:**
```bash
# Install browsers
npx playwright install --with-deps chromium

# Run with UI to debug
pnpm test:e2e:ui

# Increase timeout in playwright.config.ts
# timeout: 120000

# Check if dev servers are running
curl http://localhost:5173
curl http://localhost:4321
curl http://localhost:4322
```

### Vitest tests fail in CI

**Problem:** Tests pass locally but fail in CI

**Solutions:**
```bash
# Run tests with same conditions as CI
CI=true pnpm test

# Check for timing issues
# Use vi.useFakeTimers() for time-dependent tests

# Check for environment-specific issues
# Ensure tests don't depend on local files or services
```

### Coverage not generated

**Problem:** No coverage reports

**Solutions:**
```bash
# Install coverage package
pnpm add -D @vitest/coverage-v8

# Run with coverage flag
pnpm test:coverage

# Check vitest.config.ts for coverage settings
```

## Git Hooks Issues

### Pre-commit hook fails

**Problem:** Commit blocked by Husky hooks

**Solutions:**
```bash
# Fix linting errors
pnpm lint:fix

# Fix formatting
pnpm format

# If hooks are broken, skip temporarily (not recommended)
git commit --no-verify -m "message"

# Reinstall hooks
rm -rf .husky
pnpm prepare
```

### Commitlint fails

**Problem:** `subject may not be empty` or `type may not be empty`

**Solution:**
Use conventional commit format:
```bash
# Correct format
git commit -m "feat(web): add new feature"
git commit -m "fix(auth): resolve login bug"

# Incorrect format
git commit -m "updates"  # ❌
git commit -m "fixed bug"  # ❌
```

### Husky not working on Windows

**Problem:** Hooks not executing on Windows

**Solutions:**
1. Ensure Git Bash is installed
2. Check if hooks use `npx.cmd` instead of `npx`
3. Verify hook files have correct line endings (LF not CRLF)
4. Run `pnpm prepare` to reinstall hooks

## Performance Issues

### Slow build times

**Solutions:**
```bash
# Enable Turborepo remote caching
# Add to turbo.json:
# "remoteCache": { "enabled": true }

# Use more workers
pnpm build --concurrency=10

# Check what's taking time
pnpm build --profile

# Clear cache and rebuild
rm -rf .turbo node_modules/.cache
pnpm build
```

### Slow dev server startup

**Solutions:**
1. Reduce number of apps running: `pnpm --filter @repo/web dev`
2. Disable source maps in dev (vite.config.ts)
3. Use SWC instead of Babel if applicable
4. Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096"`

## Getting More Help

If you're still stuck:

1. **Check existing issues**: Search GitHub issues for similar problems
2. **Check documentation**: Review docs in `/docs` folder
3. **Check logs**: Look at detailed error messages and stack traces
4. **Ask for help**: Open a GitHub issue with:
   - What you're trying to do
   - What you expected to happen
   - What actually happened
   - Steps to reproduce
   - Your environment (OS, Node version, pnpm version)
   - Relevant logs and error messages

## Useful Commands

```bash
# Check versions
node --version
pnpm --version
wrangler --version

# Check what's running
lsof -i :5173  # Linux/Mac
netstat -ano | findstr :5173  # Windows

# Clean everything
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset database
docker compose -f apps/web/docker-compose.yml down -v
docker compose -f apps/web/docker-compose.yml up -d

# Clear all caches
rm -rf .turbo node_modules/.cache apps/*/.turbo packages/*/.turbo
```
