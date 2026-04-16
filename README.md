# Cloudflare One

[![CI](https://github.com/obakh/cloudflare-one/actions/workflows/ci.yml/badge.svg)](https://github.com/obakh/cloudflare-one/actions/workflows/ci.yml)
[![Deploy Web](https://github.com/obakh/cloudflare-one/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/obakh/cloudflare-one/actions/workflows/deploy-web.yml)
[![Deploy Admin](https://github.com/obakh/cloudflare-one/actions/workflows/deploy-admin.yml/badge.svg)](https://github.com/obakh/cloudflare-one/actions/workflows/deploy-admin.yml)
[![Deploy Blog](https://github.com/obakh/cloudflare-one/actions/workflows/deploy-blog.yml/badge.svg)](https://github.com/obakh/cloudflare-one/actions/workflows/deploy-blog.yml)
[![Deploy App](https://github.com/obakh/cloudflare-one/actions/workflows/deploy-app.yml/badge.svg)](https://github.com/obakh/cloudflare-one/actions/workflows/deploy-app.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/obakh/cloudflare-one?style=social)](https://github.com/obakh/cloudflare-one/stargazers)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-ef4444.svg)](https://turbo.build/repo)

> **⚠️ DISCLAIMER**: This is an **unofficial, community-created template** and is **NOT affiliated with, endorsed by, or representing Cloudflare, Inc.** in any way. This project is my personal work and does not represent Cloudflare's official standards, recommendations, or quality guidelines. Use at your own discretion.

A production-ready, scalable full-stack monorepo with React Router 7 + Cloudflare Workers, powered by pnpm workspaces and Turborepo.

**📋 [Read Full Disclaimer](./DISCLAIMER.md)** - This is an unofficial community template, not affiliated with Cloudflare, Inc.

## Why "Cloudflare One"?

I created this template because I love Cloudflare and wanted to have all their products and services integrated in one comprehensive template. Instead of starting from scratch every time I have a new idea, this monorepo allows me to:

- **Rapid Prototyping**: Test new ideas quickly without spending time on boilerplate setup
- **All-in-One Solution**: Access to Cloudflare Workers, R2, KV, D1, Hyperdrive, AI, Queues, and more - all pre-configured
- **Build for the Future**: A scalable monorepo architecture that can grow with any project
- **Learn and Experiment**: Explore Cloudflare's ecosystem with working examples and best practices

The name "Cloudflare One" reflects the vision: **one template to build anything** on Cloudflare's platform. Whether you're building a SaaS app, a blog, an admin dashboard, or experimenting with AI - everything you need is here, ready to go.

## Tech Stack

### Core Technologies
- **Build System**: Turborepo + pnpm workspaces
- **Language**: TypeScript
- **Linting & Formatting**: Biome
- **Testing**: Vitest + Playwright
- **Git Hooks**: Husky + lint-staged + Commitlint

### Frontend
- **Framework**: React 19 + React Router 7 (SSR)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Blog**: Astro with MDX support
- **Admin**: Astro + React
- **Desktop**: Tauri (cross-platform)
- **Storybook**: Component documentation

### Backend & Infrastructure
- **Runtime**: Cloudflare Workers
- **API Framework**: Hono
- **Database**: PostgreSQL via Cloudflare Hyperdrive
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **File Storage**: Cloudflare R2
- **Key-Value**: Cloudflare KV
- **Queues**: Cloudflare Queues
- **Cron**: Cloudflare Cron Triggers
- **Workflows**: Cloudflare Workflows
- **AI**: Cloudflare Workers AI

### Observability & Security
- **Monitoring**: Sentry (@sentry/cloudflare)
- **Analytics**: Custom analytics + consent management
- **Security**: Cloudflare Turnstile, rate limiting, security headers
- **SEO**: Prerendering, meta tags, sitemap generation

### Additional Features
- **Email**: Resend, SendGrid, Cloudflare Email Workers
- **Payments**: Payment processing integration
- **i18n**: Internationalization support
- **Feature Flags**: Feature flag management
- **A/B Testing**: Experiments framework
- **Real-time**: Chat functionality
- **Media**: Image processing with Cloudflare Puppeteer
- **Invoicing**: Invoice generation
- **Integrations**: Third-party service integrations

## Structure

```
├── apps/
│   ├── web/                 # Main React Router app + Cloudflare Workers (port 5173)
│   ├── app/                 # Secondary React Router app (port 5174)
│   ├── blog/                # Astro blog with MDX (port 4321)
│   ├── admin/               # Admin dashboard - Astro + React (port 4322)
│   ├── desktop/             # Tauri desktop application
│   ├── docs/                # Mintlify documentation site
│   └── storybook/           # Component library documentation
├── packages/
│   ├── ai/                  # Workers AI integration (@repo/ai)
│   ├── analytics/           # Analytics + Consent management (@repo/analytics)
│   ├── auth/                # Better Auth + Drizzle ORM (@repo/auth)
│   ├── chat/                # Real-time chat functionality (@repo/chat)
│   ├── config/              # Shared TypeScript configs (@repo/config)
│   ├── db/                  # PostgreSQL + Drizzle helpers (@repo/db)
│   ├── editor/              # Rich text editor components (@repo/editor)
│   ├── embed/               # Embeddable widgets (@repo/embed)
│   ├── experiments/         # A/B testing framework (@repo/experiments)
│   ├── feature-flags/       # Feature flag management (@repo/feature-flags)
│   ├── i18n/                # Internationalization (@repo/i18n)
│   ├── import/              # Data import utilities (@repo/import)
│   ├── inbox/               # Inbox/messaging system (@repo/inbox)
│   ├── integrations/        # Third-party integrations (@repo/integrations)
│   ├── invoice/             # Invoice generation (@repo/invoice)
│   ├── location/            # Geolocation services (@repo/location)
│   ├── media/               # Media processing (@repo/media)
│   ├── notifications/       # Email + Queues (@repo/notifications)
│   ├── observability/       # Sentry + monitoring (@repo/observability)
│   ├── payments/            # Payment processing (@repo/payments)
│   ├── scheduling/          # Cron triggers (@repo/scheduling)
│   ├── security/            # Turnstile + Headers + Rate Limit (@repo/security)
│   ├── seo/                 # SEO + Prerendering (@repo/seo)
│   ├── storage/             # R2 + storage helpers (@repo/storage)
│   ├── ui/                  # Shared React components (@repo/ui)
│   ├── utils/               # Shared utilities (@repo/utils)
│   └── workflows/           # Cloudflare Workflows (@repo/workflows)
├── e2e/                     # Playwright end-to-end tests
├── turbo.json               # Turborepo configuration
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.16.0 ([Download](https://nodejs.org/))
- **pnpm** 9.15.0 or later ([Install](https://pnpm.io/installation))
- **Docker** (optional, for PostgreSQL) ([Install](https://docs.docker.com/get-docker/))
- **Cloudflare Account** (for deployment) ([Sign up](https://dash.cloudflare.com/sign-up))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/obakh/cloudflare-one.git
   cd cloudflare-one
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy the example environment files for each app:
   ```bash
   # Web app (main React Router app)
   cp apps/web/.dev.vars.example apps/web/.dev.vars

   # Secondary app
   cp apps/app/.dev.vars.example apps/app/.dev.vars

   # Blog
   cp apps/blog/.dev.vars.example apps/blog/.dev.vars

   # Admin dashboard
   cp apps/admin/.dev.vars.example apps/admin/.dev.vars
   ```

   **Minimum required configuration** for `apps/web/.dev.vars`:
   ```bash
   BETTER_AUTH_URL="http://localhost:5173"
   BETTER_AUTH_SECRET="your-secret-key-at-least-32-characters-long"
   ```

   Generate a secure secret with: `openssl rand -base64 32`

4. **Start PostgreSQL (optional, for authentication)**

   If you want to use authentication features:
   ```bash
   docker compose -f apps/web/docker-compose.yml up -d
   ```

   This starts PostgreSQL on `localhost:5432` with:
   - User: `myuser`
   - Password: `mypassword`
   - Database: `mydatabase`

5. **Start development**

   Start all apps simultaneously:
   ```bash
   pnpm dev
   ```

   Or start individual apps:
   ```bash
   # Main web app (http://localhost:5173)
   pnpm --filter @repo/web dev

   # Secondary app (http://localhost:5174)
   pnpm --filter @repo/app dev

   # Blog (http://localhost:4321)
   pnpm --filter @repo/blog dev

   # Admin dashboard (http://localhost:4322)
   pnpm --filter @repo/admin dev

   # Documentation (http://localhost:3004)
   pnpm --filter @repo/docs dev

   # Storybook (http://localhost:6006)
   pnpm --filter @repo/storybook dev

   # Desktop app (http://localhost:1420)
   pnpm --filter @repo/desktop dev
   ```

6. **Access the apps**
   - Web app: http://localhost:5173
   - Secondary app: http://localhost:5174
   - Blog: http://localhost:4321
   - Admin: http://localhost:4322
   - Docs: http://localhost:3004
   - Storybook: http://localhost:6006
   - Desktop: http://localhost:1420 (Tauri app)

### Next Steps

- **New to the project?** Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for a complete development guide
- **Setting up authentication?** See [Setting Up Authentication](#setting-up-authentication) below
- **Having issues?** See [docs/troubleshooting.md](./docs/troubleshooting.md)
- **Ready to deploy?** See [Deployment](#deployment) section

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

### Automatic Deployment with GitHub Actions

This monorepo is configured with **GitHub Actions** for automatic deployment to Cloudflare Workers. Every push to the `main` branch triggers automated deployments for all apps.

#### How It Works

1. **Push to main branch** → GitHub Actions automatically runs
2. **CI Pipeline** runs tests and type checks
3. **Deployment Workflows** deploy each app to Cloudflare Workers:
   - `deploy-web.yml` → Deploys the main web app
   - `deploy-app.yml` → Deploys the secondary app
   - `deploy-blog.yml` → Deploys the blog
   - `deploy-admin.yml` → Deploys the admin dashboard

#### Setting Up GitHub Secrets

To enable automatic deployments, you need to add two secrets to your GitHub repository:

**1. Get your Cloudflare API Token:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use the "Edit Cloudflare Workers" template
   - Or create a custom token with these permissions:
     - Account > Cloudflare Workers Scripts > Edit
     - Account > Account Settings > Read
   - Copy the generated token

**2. Get your Cloudflare Account ID:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Select any website or go to Workers & Pages
   - Your Account ID is displayed on the right sidebar
   - Or find it in the URL: `dash.cloudflare.com/<ACCOUNT_ID>/...`

**3. Add secrets to GitHub:**
   - Go to your GitHub repository
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add these two secrets:
     - Name: `CLOUDFLARE_API_TOKEN` | Value: `<your-api-token>`
     - Name: `CLOUDFLARE_ACCOUNT_ID` | Value: `<your-account-id>`

#### Manual Deployment

You can also deploy manually using the CLI:

```bash
# Deploy all apps
pnpm --filter "./apps/*" deploy

# Deploy individual apps
pnpm --filter @repo/web deploy
pnpm --filter @repo/blog deploy
pnpm --filter @repo/admin deploy
pnpm --filter @repo/app deploy
```

#### Custom Domains

To use custom domains with your Cloudflare Workers:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Select your deployed worker
4. Go to **Settings** → **Domains & Routes**
5. Click **Add Custom Domain**
6. Enter your subdomain (e.g., `app.yourdomain.com`)
7. Cloudflare will automatically configure DNS

**Example setup:**
- `monorepo.cc` → Main web app
- `app.monorepo.cc` → Secondary app
- `blog.monorepo.cc` → Blog
- `admin.monorepo.cc` → Admin dashboard

### Desktop App Releases

The desktop app is automatically built and released for Windows, macOS, and Linux when you push a tag.

#### Creating a Release

1. **Update the version** in `apps/desktop/src-tauri/tauri.conf.json`:
   ```json
   {
     "version": "0.2.0"
   }
   ```

2. **Commit the version change**:
   ```bash
   git add apps/desktop/src-tauri/tauri.conf.json
   git commit -m "chore: bump desktop app to v0.2.0"
   ```

3. **Create and push a tag**:
   ```bash
   git tag desktop-v0.2.0
   git push origin desktop-v0.2.0
   ```

4. **GitHub Actions will automatically**:
   - Build the app for Windows (MSI + NSIS installers)
   - Build the app for macOS (DMG for Intel and Apple Silicon)
   - Build the app for Linux (AppImage + DEB)
   - Create a GitHub Release with all installers
   - Attach release notes and download instructions

#### Release Artifacts

After the workflow completes, users can download:
- **Windows**: `Desktop.App_x64-setup.exe` or `Desktop.App_x64_en-US.msi`
- **macOS**: `Desktop.App_aarch64.dmg` (Apple Silicon) or `Desktop.App_x64.dmg` (Intel)
- **Linux**: `Desktop.App.AppImage` or `Desktop.App_amd64.deb`

The release will be available at: `https://github.com/obakh/cloudflare-one/releases`

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

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=obakh/cloudflare-one&type=Date)](https://star-history.com/#obakh/cloudflare-one&Date)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Made with ❤️ for the Cloudflare community** | [Report Bug](https://github.com/obakh/cloudflare-one/issues) | [Request Feature](https://github.com/obakh/cloudflare-one/issues)
