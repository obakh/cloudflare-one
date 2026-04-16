# Documentation

This is the documentation site powered by [Mintlify](https://mintlify.com).

## Development

```bash
pnpm --filter @repo/docs dev
```

This will start the docs server at http://localhost:3004.

## Structure

```
docs/
├── mint.json           # Mintlify configuration
├── introduction.mdx    # Home page
├── quickstart.mdx      # Quick start guide
├── guides/             # How-to guides
│   ├── authentication.mdx
│   └── deployment.mdx
├── api-reference/      # API documentation
│   ├── introduction.mdx
│   └── endpoints/
│       ├── auth.mdx
│       └── users.mdx
└── logos/              # Brand assets
```

## Configuration

Edit `mint.json` to customize:

- Navigation structure
- Colors and branding
- Social links
- API reference settings

## Deployment

Mintlify handles deployment automatically when connected to your repository.

1. Sign up at [mintlify.com](https://mintlify.com)
2. Connect your repository
3. Point to the `apps/docs` directory
4. Deploy!

## Adding Pages

1. Create a new `.mdx` file
2. Add frontmatter with title and description
3. Add the page to `mint.json` navigation
4. Write your content using MDX

Example:

```mdx
---
title: My New Page
description: A description of the page
---

# My New Page

Content goes here...
```
