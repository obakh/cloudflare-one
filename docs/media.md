# Media Package

Image transformation and browser rendering utilities for Cloudflare Workers.

## Image Transformation

Transform images on-the-fly using Cloudflare's Image Resizing.

### Basic Usage

```ts
import { transformImage, buildImageUrl } from "@repo/media/images";

// Transform via fetch
const response = await transformImage("https://example.com/image.jpg", {
  width: 800,
  height: 600,
  fit: "cover",
  format: "webp",
  quality: 85,
});

// Build URL for HTML
const url = buildImageUrl("https://example.com/image.jpg", {
  width: 800,
  format: "auto",
});
// Returns: /cdn-cgi/image/width=800,format=auto/https://example.com/image.jpg
```

### Auto Format Negotiation

```ts
import { transformImageWithAccept } from "@repo/media/images";

export default {
  async fetch(request: Request) {
    const imageUrl = new URL(request.url).searchParams.get("url");

    // Automatically serves AVIF, WebP, or original based on Accept header
    return transformImageWithAccept(imageUrl, request, {
      width: 800,
      quality: 85,
    });
  },
};
```

### Image Presets

```ts
import { ImagePresets } from "@repo/media/images";

// Built-in presets
const thumbnail = await ImagePresets.thumbnail.transform(imageUrl);  // 150x150
const avatar = await ImagePresets.avatar.transform(imageUrl);        // 64x64
const card = await ImagePresets.card.transform(imageUrl);            // 400x300
const hero = await ImagePresets.hero.transform(imageUrl);            // 1200px wide
const og = await ImagePresets.og.transform(imageUrl);                // 1200x630
const mobile = await ImagePresets.mobile.transform(imageUrl);        // 800px, auto format
const retina = await ImagePresets.retina.transform(imageUrl);        // 2x DPR
```

### Custom Transformer

```ts
import { createImageTransformer } from "@repo/media/images";

const productImage = createImageTransformer({
  width: 600,
  height: 600,
  fit: "contain",
  background: "#ffffff",
  quality: 90,
});

const response = await productImage.transform(imageUrl);

// With Accept header negotiation
const response = await productImage.transformWithAccept(imageUrl, request);
```

### Transform Options

```ts
interface ImageTransformOptions {
  width?: number | "auto";
  height?: number | "auto";
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  format?: "avif" | "webp" | "jpeg" | "png" | "auto";
  quality?: number;           // 1-100
  gravity?: "auto" | "left" | "right" | "top" | "bottom" | "center" | { x: number; y: number };
  dpr?: number;               // 1-3
  blur?: number;              // 1-250
  brightness?: number;        // -1 to 1
  contrast?: number;          // -1 to 1
  rotate?: 0 | 90 | 180 | 270;
  sharpen?: number;           // 0-10
  background?: string;        // hex color for padding
  metadata?: "keep" | "copyright" | "none";
  anim?: boolean;             // preserve animation
}
```

## Browser Rendering

Generate screenshots, PDFs, and scrape content using Puppeteer.

### Setup

Add the Browser binding to `wrangler.toml`:

```toml
[browser]
binding = "BROWSER"
```

### Screenshots

```ts
import { screenshot } from "@repo/media/browser";

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url).searchParams.get("url");

    const png = await screenshot(env.BROWSER, url, {
      width: 1280,
      height: 720,
      fullPage: false,
      format: "png",
    });

    return new Response(png, {
      headers: { "Content-Type": "image/png" },
    });
  },
};
```

### PDF Generation

```ts
import { generatePdf } from "@repo/media/browser";

const pdf = await generatePdf(env.BROWSER, "https://example.com/invoice", {
  format: "A4",
  landscape: false,
  printBackground: true,
  margin: {
    top: "1cm",
    right: "1cm",
    bottom: "1cm",
    left: "1cm",
  },
});

return new Response(pdf, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=invoice.pdf",
  },
});
```

### Web Scraping

```ts
import { scrapeContent } from "@repo/media/browser";

const result = await scrapeContent(env.BROWSER, "https://example.com", {
  waitForSelector: ".content",
  waitForNetworkIdle: true,
});

console.log(result.title);       // Page title
console.log(result.meta);        // { description: "...", "og:image": "..." }
console.log(result.links);       // [{ href: "...", text: "..." }]
console.log(result.text);        // Text content
```

### Render HTML to Image/PDF

```ts
import { renderHtmlToImage, renderHtmlToPdf } from "@repo/media/browser";

const html = `
  <html>
    <body style="background: #667eea; color: white; padding: 40px;">
      <h1>Hello World</h1>
    </body>
  </html>
`;

// To image
const png = await renderHtmlToImage(env.BROWSER, html, {
  width: 800,
  height: 400,
});

// To PDF
const pdf = await renderHtmlToPdf(env.BROWSER, html, {
  format: "A4",
});
```

### OG Image Generator

```ts
import { createOgImageGenerator } from "@repo/media/browser";

const ogGenerator = createOgImageGenerator(env.BROWSER, {
  width: 1200,
  height: 630,
});

// Generate with default template
const image = await ogGenerator.generate({
  title: "My Blog Post",
  description: "An interesting article about...",
  author: "John Doe",
});

// Generate with custom HTML
const customImage = await ogGenerator.generateFromHtml(`
  <html>
    <body style="...">
      <h1>Custom OG Image</h1>
    </body>
  </html>
`);
```

### Browser Session (Multiple Operations)

```ts
import { createBrowserSession } from "@repo/media/browser";

const session = await createBrowserSession(env.BROWSER);

try {
  // Take multiple screenshots with same browser instance
  const page1 = await session.screenshot("https://example.com");
  const page2 = await session.screenshot("https://example.org");

  // Generate PDFs
  const pdf1 = await session.pdf("https://example.com/invoice/1");
  const pdf2 = await session.pdf("https://example.com/invoice/2");
} finally {
  await session.close();
}
```

## Screenshot Options

```ts
interface ScreenshotOptions {
  width?: number;              // Viewport width (default: 1280)
  height?: number;             // Viewport height (default: 720)
  fullPage?: boolean;          // Capture full page (default: false)
  format?: "png" | "jpeg" | "webp";
  quality?: number;            // JPEG/WebP quality 0-100
  deviceScaleFactor?: number;  // DPR (default: 1)
  waitForSelector?: string;    // Wait for element
  waitForTimeout?: number;     // Wait ms before capture
  clip?: { x, y, width, height };
  omitBackground?: boolean;    // Transparent background
}
```

## PDF Options

```ts
interface PdfOptions {
  format?: "A4" | "Letter" | "Legal" | "Tabloid" | "A3" | "A5";
  landscape?: boolean;
  printBackground?: boolean;
  scale?: number;              // 0.1-2
  margin?: { top?, right?, bottom?, left? };
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
  waitForSelector?: string;
}
```

## Best Practices

1. **Image Resizing**: Use `format: "auto"` to serve optimal format based on browser support
2. **Browser Sessions**: Reuse sessions for multiple operations to reduce cold starts
3. **Wait Strategies**: Use `waitForSelector` instead of `waitForTimeout` when possible
4. **Memory**: Browser rendering uses more memory - monitor usage in production
5. **Caching**: Cache generated images/PDFs using KV or R2

## Pricing

- Image Resizing: Included with Pro+ plans, or per-request on Free
- Browser Rendering: Billed per browser session minute
- See [Cloudflare Pricing](https://developers.cloudflare.com/images/pricing/) for details
