# SEO Package

Comprehensive SEO utilities for Cloudflare Workers including meta tags, JSON-LD structured data, bot detection, and prerendering.

## Quick Start

```ts
import { 
  generateMetaTagsHTML, 
  createArticle, 
  detectBot, 
  createPrerenderMiddleware 
} from "@repo/seo";
```

## Meta Tags

Generate SEO meta tags, Open Graph, and Twitter Cards.

### Basic Usage

```ts
import { generateMetaTags, generateMetaTagsHTML } from "@repo/seo/meta";

const tags = generateMetaTags({
  title: "My Page Title",
  description: "Page description for search engines",
  url: "https://example.com/page",
  siteName: "My Site",
  image: "https://example.com/og-image.jpg",
  imageWidth: 1200,
  imageHeight: 630,
  twitterCard: "summary_large_image",
  twitterSite: "@mysite",
});

// Or get HTML string directly
const html = generateMetaTagsHTML({
  title: "My Page",
  description: "Description",
});
```

### Article Meta

```ts
import { generateMetaTagsHTML, type ArticleMetaConfig } from "@repo/seo/meta";

const articleMeta: ArticleMetaConfig = {
  type: "article",
  title: "How to Build a Blog",
  description: "Learn how to build a blog with Cloudflare Workers",
  url: "https://example.com/blog/how-to-build",
  publishedTime: "2024-01-15T10:00:00Z",
  modifiedTime: "2024-01-20T14:30:00Z",
  articleAuthor: "John Doe",
  articleSection: "Technology",
  articleTags: ["cloudflare", "workers", "blog"],
};

const html = generateMetaTagsHTML(articleMeta);
```

### Product Meta

```ts
import { generateMetaTagsHTML, type ProductMetaConfig } from "@repo/seo/meta";

const productMeta: ProductMetaConfig = {
  type: "product",
  title: "Premium Widget",
  description: "The best widget money can buy",
  image: "https://example.com/widget.jpg",
  price: "29.99",
  currency: "USD",
  availability: "in stock",
};
```

### Canonical & Hreflang

```ts
import { generateCanonicalTag, generateHreflangTags } from "@repo/seo/meta";

const canonical = generateCanonicalTag("https://example.com/page");

const hreflang = generateHreflangTags({
  "en": "https://example.com/en/page",
  "es": "https://example.com/es/page",
  "x-default": "https://example.com/page",
});
```

## JSON-LD Structured Data

Generate schema.org structured data for rich search results.

### React Component

```tsx
import { JsonLd, createArticle } from "@repo/seo/json-ld";

function BlogPost({ post }) {
  return (
    <>
      <JsonLd data={createArticle({
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        datePublished: post.publishedAt,
        author: { name: post.author.name, url: post.author.url },
        publisher: { name: "My Blog", logo: "https://example.com/logo.png" },
      })} />
      <article>...</article>
    </>
  );
}
```

### HTML String (Server-Side)

```ts
import { generateJsonLdScript, createOrganization } from "@repo/seo/json-ld";

const script = generateJsonLdScript(createOrganization({
  name: "My Company",
  url: "https://example.com",
  logo: "https://example.com/logo.png",
  sameAs: [
    "https://twitter.com/mycompany",
    "https://linkedin.com/company/mycompany",
  ],
}));
```

### Available Schema Helpers

```ts
import {
  createOrganization,  // Company/organization info
  createWebSite,       // Website with search action
  createArticle,       // Blog posts, news articles
  createProduct,       // E-commerce products
  createBreadcrumbs,   // Navigation breadcrumbs
  createFAQPage,       // FAQ sections
  createLocalBusiness, // Physical business locations
  createEvent,         // Events and conferences
} from "@repo/seo/json-ld";
```

### Examples

```ts
// Breadcrumbs
const breadcrumbs = createBreadcrumbs([
  { name: "Home", url: "https://example.com" },
  { name: "Products", url: "https://example.com/products" },
  { name: "Widget", url: "https://example.com/products/widget" },
]);

// FAQ Page
const faq = createFAQPage([
  { question: "What is this?", answer: "This is a product." },
  { question: "How much does it cost?", answer: "It costs $29.99." },
]);

// Product
const product = createProduct({
  name: "Premium Widget",
  description: "The best widget",
  image: "https://example.com/widget.jpg",
  price: 29.99,
  currency: "USD",
  availability: "InStock",
  brand: "WidgetCo",
  ratingValue: 4.5,
  reviewCount: 100,
});

// Local Business
const business = createLocalBusiness({
  name: "My Restaurant",
  address: {
    streetAddress: "123 Main St",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94102",
    addressCountry: "US",
  },
  telephone: "+1-555-555-5555",
  openingHours: ["Mo-Fr 09:00-17:00", "Sa 10:00-14:00"],
  priceRange: "$$",
});
```

## Bot Detection

Detect search engine crawlers and social media bots.

### Basic Detection

```ts
import { detectBot, shouldPrerender } from "@repo/seo/bots";

export default {
  async fetch(request) {
    const bot = detectBot(request);
    
    if (bot.isBot) {
      console.log(`Bot: ${bot.botName}`);
      console.log(`Search engine: ${bot.isSearchEngine}`);
      console.log(`Social bot: ${bot.isSocialBot}`);
    }
    
    // Quick check for prerendering
    if (shouldPrerender(request)) {
      return prerenderResponse(request);
    }
    
    return fetch(request);
  },
};
```

### Specific Bot Checks

```ts
import { isBot, isSearchEngine, isSocialBot } from "@repo/seo/bots";

if (isBot(request, "googlebot")) {
  // Handle Googlebot specifically
}

if (isSearchEngine(request)) {
  // Any search engine crawler
}

if (isSocialBot(request)) {
  // Facebook, Twitter, LinkedIn, etc.
}
```

### Custom Bot Detector

```ts
import { createBotDetector } from "@repo/seo/bots";

const detector = createBotDetector({
  additionalBots: ["mybot", "customcrawler"],
  excludeBots: ["ahrefsbot"], // Ignore certain bots
  customPatterns: [/mycustom.*bot/i],
});

const result = detector.detect(request);
if (detector.shouldPrerender(request)) {
  // Prerender for this bot
}
```

### Known Bots

```ts
import { SEARCH_ENGINE_BOTS, SOCIAL_BOTS, ALL_BOTS } from "@repo/seo/bots";

// Search engines: googlebot, bingbot, yandexbot, etc.
// Social bots: facebookexternalhit, twitterbot, linkedinbot, etc.
```

## Prerendering

Serve prerendered HTML to bots for better SEO.

### Middleware Approach

```ts
import { createPrerenderMiddleware } from "@repo/seo/prerender";

const prerender = createPrerenderMiddleware({
  rendererUrl: "https://service.prerender.io/",
  cacheTtl: 600, // 10 minutes
  swr: 86400,    // 24 hours stale-while-revalidate
  excludeRoutes: ["/api/", "/admin/", "/auth/"],
  onError: (error, request) => {
    console.error("Prerender failed:", error);
  },
});

export default {
  async fetch(request, env, ctx) {
    const result = await prerender(request, ctx);
    
    if (result.prerendered) {
      console.log(`Served prerendered to ${result.bot?.botName}`);
      return result.response;
    }
    
    // Serve SPA for regular users
    return fetch(request);
  },
};
```

### Simple Handler

```ts
import { handlePrerender } from "@repo/seo/prerender";

export default {
  async fetch(request, env, ctx) {
    return handlePrerender(request, ctx, {
      origin: "https://my-spa.example.com",
      excludeRoutes: ["/api/", "/admin/"],
      cacheTtl: 600,
    });
  },
};
```

### Inject Meta Tags

```ts
import { injectMetaTags } from "@repo/seo/prerender";

const response = await fetch(request);

// Inject/update meta tags using HTMLRewriter
return injectMetaTags(response, {
  title: "Dynamic Title",
  description: "Dynamic description",
  "og:image": "https://example.com/dynamic-og.jpg",
});
```

## Full Example

```ts
import { Hono } from "hono";
import { detectBot, shouldPrerender } from "@repo/seo/bots";
import { generateMetaTagsHTML, formatTitle } from "@repo/seo/meta";
import { generateJsonLdScript, createArticle } from "@repo/seo/json-ld";
import { injectMetaTags } from "@repo/seo/prerender";

const app = new Hono();

app.get("/blog/:slug", async (c) => {
  const slug = c.req.param("slug");
  const post = await getPost(slug);
  
  // Check if bot
  if (shouldPrerender(c.req.raw)) {
    // Fetch the SPA HTML
    const response = await fetch(c.req.url);
    
    // Inject SEO meta tags
    return injectMetaTags(response, {
      title: formatTitle(post.title, "My Blog"),
      description: post.excerpt,
      "og:image": post.image,
      "og:type": "article",
      "article:published_time": post.publishedAt,
    });
  }
  
  // Regular users get the SPA
  return fetch(c.req.raw);
});

export default app;
```

## Best Practices

1. **Use descriptive titles** - Include keywords naturally, keep under 60 characters
2. **Write compelling descriptions** - 150-160 characters, include call-to-action
3. **Add structured data** - Helps search engines understand your content
4. **Implement canonical URLs** - Prevent duplicate content issues
5. **Use hreflang for i18n** - Help search engines serve the right language
6. **Cache prerendered pages** - Reduce latency and origin load
7. **Exclude private routes** - Don't prerender auth, admin, or API routes
8. **Test with Search Console** - Verify your structured data is valid

## References

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Cloudflare Workers HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/)
