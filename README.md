# Cloudflare One

[![CI](https://github.com/obakh/cloudflare-one/actions/workflows/ci.yml/badge.svg)](https://github.com/obakh/cloudflare-one/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-ef4444.svg)](https://turbo.build/repo)

> **⚠️ DISCLAIMER**: This is an **unofficial, community-created template** and is **NOT affiliated with, endorsed by, or representing Cloudflare, Inc.** in any way. This project is my personal work and does not represent Cloudflare's official standards, recommendations, or quality guidelines. Use at your own discretion.

A scalable full-stack monorepo with React Router 7 + Cloudflare Workers, powered by pnpm workspaces and Turborepo.

**📋 [Read Full Disclaimer](./DISCLAIMER.md)** - This is an unofficial community template, not affiliated with Cloudflare, Inc.

## Tech Stack

- **Build System**: Turborepo + pnpm workspaces
- **Frontend**: React 19 + React Router 7 (SSR)
- **Blog**: Astro with MDX support
- **Admin**: Astro + React + shadcn/ui
- **Auth**: Better Auth + Drizzle ORM
- **Styling**: Tailwind CSS
- **Backend**: Hono on Cloudflare Workers
- **Database**: PostgreSQL via Cloudflare Hyperdrive
- **Monitoring**: Sentry SDK (@sentry/cloudflare)
- **Language**: TypeScript

## Structure

```
├── apps/
│   ├── web/                 # React Router + Cloudflare Workers (port 5173)
│   ├── blog/                # Astro blog (port 4321)
│   └── admin/               # Admin dashboard (port 4322)
├── packages/
│   ├── analytics/           # Analytics + Consent (@repo/analytics)
│   ├── auth/                # Better Auth + Drizzle (@repo/auth)
│   ├── db/                  # PostgreSQL + Drizzle helpers (@repo/db)
│   ├── i18n/                # Internationalization (@repo/i18n)
│   ├── notifications/       # Email + Queues (@repo/notifications)
│   ├── observability/       # Sentry + monitoring (@repo/observability)
│   ├── scheduling/          # Cron triggers (@repo/scheduling)
│   ├── security/            # Turnstile + Headers + Rate Limit (@repo/security)
│   ├── seo/                 # SEO + Prerendering (@repo/seo)
│   ├── storage/             # R2 + storage helpers (@repo/storage)
│   ├── ui/                  # Shared React components (@repo/ui)
│   ├── utils/               # Shared utilities (@repo/utils)
│   └── config/              # Shared TypeScript configs (@repo/config)
├── e2e/                     # Playwright end-to-end tests
├── turbo.json               # Turborepo configuration
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

## Getting Started

**New to the project?** Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for a complete development guide.

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.dev.vars.example apps/web/.dev.vars
cp apps/blog/.dev.vars.example apps/blog/.dev.vars
cp apps/admin/.dev.vars.example apps/admin/.dev.vars

# Start PostgreSQL (optional, for auth)
docker compose -f apps/web/docker-compose.yml up -d

# Start development (all apps)
pnpm dev

# Or start individual apps
pnpm --filter @repo/web dev
pnpm --filter @repo/blog dev
pnpm --filter @repo/admin dev
```

**Having issues?** See [docs/troubleshooting.md](./docs/troubleshooting.md)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm check-types` | Type-check all packages |
| `pnpm clean` | Clean all build artifacts |
| `pnpm test` | Run Vitest unit/integration tests |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm test:e2e:ui` | Run Playwright tests with UI |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Check code with Biome |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Format code with Biome |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development workflow
- Code standards
- Testing guidelines
- Commit conventions
- Pull request process

**Note**: This is an unofficial community project. See [DISCLAIMER.md](./DISCLAIMER.md) for more information.

## Security

For security concerns, see [SECURITY.md](./SECURITY.md) for our security policy and how to report vulnerabilities.

## Setting Up Authentication

1. Start PostgreSQL:
   ```bash
   docker compose -f apps/web/docker-compose.yml up -d
   ```

2. Run the auth migration:
   ```bash
   psql -f packages/auth/drizzle/0000_auth_tables.sql postgresql://myuser:mypassword@localhost:5432/mydatabase
   ```

3. Configure Hyperdrive in `apps/web/wrangler.jsonc`

4. Uncomment auth routes in `apps/web/api/index.js`

5. Use the auth client in your frontend:
   ```tsx
   import { authClient } from "@repo/auth/client";

   // Sign up
   await authClient.signUp.email({
     email: "user@example.com",
     password: "password123",
     name: "John Doe",
   });

   // Sign in
   await authClient.signIn.email({
     email: "user@example.com",
     password: "password123",
   });
   ```

## Working with Packages

```tsx
// Import shared components and utilities
import { Button } from "@repo/ui";
import { cn, formatDate } from "@repo/utils";
import { authClient } from "@repo/auth/client";
import { captureException } from "@repo/observability/sentry";
import { verifyTurnstile } from "@repo/security/turnstile";
import { applySecurityHeaders } from "@repo/security/headers";
import { rateLimitMiddleware, RateLimitKeys } from "@repo/security/rate-limit";

// Database utilities
import { query, queryOne, execute } from "@repo/db/client";
import { createDrizzle } from "@repo/db/drizzle";

// Storage (R2 presigned URLs)
import { createR2Client, generateUploadUrl, validateUpload } from "@repo/storage/r2";

// Notifications
import { createEmailClient, sendEmail } from "@repo/notifications/email";
import { createQueueProducer, createQueueConsumer } from "@repo/notifications/queues";

// Internationalization
import { detectLocale, LOCALES } from "@repo/i18n/locale";
import { createTranslator, interpolate } from "@repo/i18n/translator";

// SEO
import { generateMetaTags, createArticle, detectBot } from "@repo/seo";
import { createPrerenderMiddleware } from "@repo/seo/prerender";

// Analytics
import { init, track, page, identify } from "@repo/analytics/client";
import { GoogleAnalytics, FacebookPixel } from "@repo/analytics/providers";
import { createServerAnalytics } from "@repo/analytics/server";
```

## Deployment

```bash
# Deploy all apps
pnpm --filter "./apps/*" deploy

# Deploy individual apps
pnpm --filter @repo/web deploy
pnpm --filter @repo/blog deploy
pnpm --filter @repo/admin deploy
```

## Monitoring with Sentry

See [docs/sentry-setup.md](docs/sentry-setup.md) for instructions on setting up Sentry integration for traces and logs.

## Testing

See [docs/testing.md](docs/testing.md) for comprehensive testing guide including:
- Unit testing with Vitest
- E2E testing with Playwright
- Testing Cloudflare Workers
- Coverage reports and thresholds

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow and guidelines
- [SECURITY.md](./SECURITY.md) - Security policy and best practices
- [docs/troubleshooting.md](./docs/troubleshooting.md) - Common issues and solutions
- [docs/testing.md](./docs/testing.md) - Testing guide
- [docs/deployment.md](./docs/deployment.md) - Deployment strategies
- [docs/](./docs/) - Additional documentation for features
