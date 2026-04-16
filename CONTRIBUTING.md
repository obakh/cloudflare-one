# Contributing to Cloudflare One

> **⚠️ DISCLAIMER**: This is an unofficial, community-created template and is NOT affiliated with or endorsed by Cloudflare, Inc. This project represents my personal work only.

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Getting Started

### Prerequisites

- Node.js >= 20.16.0
- pnpm 9.15.0 (installed automatically via packageManager field)
- Docker (for local PostgreSQL)

### Initial Setup

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
   ```bash
   # Copy example env files
   cp apps/web/.dev.vars.example apps/web/.dev.vars
   cp apps/blog/.dev.vars.example apps/blog/.dev.vars
   cp apps/admin/.dev.vars.example apps/admin/.dev.vars
   ```

4. **Start local database (optional)**
   ```bash
   docker compose -f apps/web/docker-compose.yml up -d
   ```

5. **Run database migrations (if using auth)**
   ```bash
   cd packages/auth
   pnpm db:push
   ```

### VS Code Setup (Recommended)

Install recommended extensions when prompted, or manually:
- Biome (formatting & linting)
- Playwright (E2E testing)
- Vitest (unit testing)
- Drizzle (database)
- Tailwind CSS IntelliSense

## Development Workflow

### Starting Development

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm --filter @repo/web dev
pnpm --filter @repo/blog dev
pnpm --filter @repo/admin dev
```

Apps will be available at:
- Web: http://localhost:5173
- Blog: http://localhost:4321
- Admin: http://localhost:4322

### Working with Packages

When making changes to packages, Turborepo will automatically rebuild and hot-reload dependent apps.

```bash
# Build all packages
pnpm build

# Type check everything
pnpm check-types

# Lint and format
pnpm lint
pnpm format
```

### Adding a New Package

1. Create package directory: `packages/my-package/`
2. Add `package.json` with name `@repo/my-package`
3. Add to `pnpm-workspace.yaml` (already includes `packages/*`)
4. Add exports in `package.json`:
   ```json
   {
     "name": "@repo/my-package",
     "exports": {
       ".": "./src/index.ts"
     }
   }
   ```
5. Import in apps: `import { something } from "@repo/my-package"`

## Code Standards

### Formatting & Linting

We use **Biome** for formatting and linting (not Prettier or ESLint).

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format
```

### TypeScript

- All code must be TypeScript
- Strict mode is enabled
- No `any` types (use `unknown` if needed)
- Prefer type inference over explicit types when obvious

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Tests: `*.test.ts` or `*.spec.ts`
- Types: `types.ts` or inline with implementation

### Import Order

Biome automatically organizes imports:
1. External packages
2. Internal packages (`@repo/*`)
3. Relative imports

## Testing

### Unit Tests

We use Vitest with Cloudflare Workers runtime:

```bash
# Run all unit tests
pnpm test

# Run specific test file
pnpm --filter @repo/web test
```

**Writing tests:**
```typescript
import { describe, expect, it } from "vitest";

describe("MyFunction", () => {
  it("should do something", () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### E2E Tests

We use Playwright for end-to-end testing:

```bash
# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui
```

**Writing E2E tests:**
```typescript
import { expect, test } from "@playwright/test";

test("should render page", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("heading")).toBeVisible();
});
```

### Test Coverage

When adding new features:
- Add unit tests for utilities and business logic
- Add E2E tests for user-facing features
- Aim for >80% coverage on critical packages (auth, db, security)

## Commit Guidelines

We use **Conventional Commits** enforced by commitlint.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, config)
- `revert`: Revert a previous commit
- `wip`: Work in progress

### Scopes

Apps: `web`, `app`, `blog`, `admin`, `docs`, `storybook`, `desktop`

Packages: `ui`, `auth`, `db`, `ai`, `payments`, `analytics`, `i18n`, `config`, `utils`

Meta: `deps`, `ci`, `release`, `monorepo`

### Examples

```bash
feat(web): add user profile page
fix(auth): resolve session expiration bug
docs(readme): update installation instructions
chore(deps): upgrade react to v19
```

### Git Hooks

Pre-commit hooks will automatically:
- Format code with Biome
- Lint staged files
- Run type checking

If hooks fail, fix the issues and commit again.

## Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feat/my-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Follow code standards
   - Add tests
   - Update documentation

3. **Test locally**
   ```bash
   pnpm lint
   pnpm check-types
   pnpm test
   pnpm test:e2e
   ```

4. **Commit with conventional commits**
   ```bash
   git add .
   git commit -m "feat(web): add new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feat/my-feature
   ```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass locally
- [ ] Conventional commit format used

### PR Review Process

1. Automated checks must pass (CI, type checking, tests)
2. At least one approval required
3. Address review feedback
4. Squash and merge when approved

## Project Structure

```
├── apps/                    # Applications
│   ├── web/                # Main React Router app
│   ├── blog/               # Astro blog
│   ├── admin/              # Admin dashboard
│   ├── app/                # Secondary app
│   ├── desktop/            # Tauri desktop app
│   ├── docs/               # Mintlify docs
│   └── storybook/          # Component library docs
├── packages/               # Shared packages
│   ├── ui/                 # React components
│   ├── auth/               # Authentication
│   ├── db/                 # Database utilities
│   ├── utils/              # Shared utilities
│   └── ...                 # 20+ other packages
├── e2e/                    # Playwright E2E tests
├── docs/                   # Documentation
├── .github/                # GitHub workflows
├── .husky/                 # Git hooks
└── turbo.json              # Turborepo config
```

### Key Files

- `turbo.json` - Turborepo task configuration
- `pnpm-workspace.yaml` - Workspace definition
- `biome.json` - Formatting & linting rules
- `commitlint.config.cjs` - Commit message rules
- `.lintstagedrc` - Pre-commit hook configuration

## Common Tasks

### Adding a Dependency

```bash
# Add to root (dev dependency)
pnpm add -D <package> -w

# Add to specific app/package
pnpm add <package> --filter @repo/web

# Add workspace package
# Just import it - pnpm handles workspace: protocol
```

### Database Migrations

```bash
# Generate migration
cd packages/auth
pnpm db:generate

# Apply migration
pnpm db:migrate

# Push schema (dev only)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Deployment

```bash
# Deploy all apps
pnpm deploy

# Deploy specific app
pnpm --filter @repo/web deploy

# Preview deployment
pnpm deploy:preview
```

## Getting Help

- Check existing [documentation](./docs/)
- Review [README.md](./README.md)
- Look at similar implementations in the codebase
- Ask in pull request comments
- Check [Turborepo docs](https://turbo.build/repo/docs)
- Check [React Router docs](https://reactrouter.com/)
- Check [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
