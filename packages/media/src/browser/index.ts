/**
 * Cloudflare Browser Rendering utilities
 *
 * Generate screenshots, PDFs, and scrape content using Puppeteer in Workers.
 *
 * @example Basic usage
 * ```ts
 * import { screenshot, generatePdf, scrapeContent } from "@repo/media/browser";
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     // Take a screenshot
 *     const png = await screenshot(env.BROWSER, "https://example.com", {
 *       width: 1280,
 *       height: 720,
 *     });
 *
 *     return new Response(png, {
 *       headers: { "Content-Type": "image/png" },
 *     });
 *   }
 * };
 * ```
 */

import puppeteer, {
	type Browser,
	type PDFOptions as PuppeteerPDFOptions,
	type ScreenshotOptions as PuppeteerScreenshotOptions,
} from "@cloudflare/puppeteer";

// ============================================================================
// Types
// ============================================================================

export interface ScreenshotOptions {
	/** Viewport width (default: 1280) */
	width?: number;
	/** Viewport height (default: 720) */
	height?: number;
	/** Full page screenshot (default: false) */
	fullPage?: boolean;
	/** Image format (default: "png") */
	format?: "png" | "jpeg" | "webp";
	/** JPEG/WebP quality 0-100 (default: 80) */
	quality?: number;
	/** Device scale factor (default: 1) */
	deviceScaleFactor?: number;
	/** Wait for selector before screenshot */
	waitForSelector?: string;
	/** Wait for timeout in ms before screenshot */
	waitForTimeout?: number;
	/** Clip region */
	clip?: { x: number; y: number; width: number; height: number };
	/** Omit background (transparent) */
	omitBackground?: boolean;
}

export interface PdfOptions {
	/** Page format (default: "A4") */
	format?: "A4" | "Letter" | "Legal" | "Tabloid" | "A3" | "A5";
	/** Landscape orientation (default: false) */
	landscape?: boolean;
	/** Print background graphics (default: true) */
	printBackground?: boolean;
	/** Scale 0.1-2 (default: 1) */
	scale?: number;
	/** Page margins */
	margin?: {
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	};
	/** Header HTML template */
	headerTemplate?: string;
	/** Footer HTML template */
	footerTemplate?: string;
	/** Display header and footer */
	displayHeaderFooter?: boolean;
	/** Wait for selector before generating PDF */
	waitForSelector?: string;
}

export interface ScrapeOptions {
	/** Viewport width (default: 1280) */
	width?: number;
	/** Viewport height (default: 720) */
	height?: number;
	/** Wait for selector before scraping */
	waitForSelector?: string;
	/** Wait for timeout in ms */
	waitForTimeout?: number;
	/** Execute JavaScript and wait for network idle */
	waitForNetworkIdle?: boolean;
	/** Custom user agent */
	userAgent?: string;
}

export interface ScrapeResult {
	/** Page title */
	title: string;
	/** Page URL after redirects */
	url: string;
	/** Full HTML content */
	html: string;
	/** Text content */
	text: string;
	/** Meta tags */
	meta: Record<string, string>;
	/** Links on the page */
	links: Array<{ href: string; text: string }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildScreenshotOptions(
	format: "png" | "jpeg" | "webp",
	fullPage: boolean,
	omitBackground: boolean,
	quality?: number,
	clip?: { x: number; y: number; width: number; height: number },
): PuppeteerScreenshotOptions {
	const opts: PuppeteerScreenshotOptions = {
		type: format,
		fullPage,
		omitBackground,
	};

	if (format !== "png" && quality !== undefined) {
		return { ...opts, quality };
	}

	if (clip) {
		return { ...opts, clip };
	}

	return opts;
}

function buildPdfOptions(
	format: "A4" | "Letter" | "Legal" | "Tabloid" | "A3" | "A5",
	landscape: boolean,
	printBackground: boolean,
	scale: number,
	displayHeaderFooter: boolean,
	margin?: { top?: string; right?: string; bottom?: string; left?: string },
	headerTemplate?: string,
	footerTemplate?: string,
): PuppeteerPDFOptions {
	const opts: PuppeteerPDFOptions = {
		format,
		landscape,
		printBackground,
		scale,
		displayHeaderFooter,
	};

	if (margin) {
		return { ...opts, margin };
	}

	if (headerTemplate) {
		return { ...opts, headerTemplate };
	}

	if (footerTemplate) {
		return { ...opts, footerTemplate };
	}

	return opts;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Take a screenshot of a URL
 *
 * @example
 * ```ts
 * const png = await screenshot(env.BROWSER, "https://example.com", {
 *   width: 1920,
 *   height: 1080,
 *   fullPage: true,
 * });
 * ```
 */
export async function screenshot(
	browserBinding: Fetcher,
	url: string,
	options: ScreenshotOptions = {},
): Promise<Uint8Array> {
	const {
		width = 1280,
		height = 720,
		fullPage = false,
		format = "png",
		quality = 80,
		deviceScaleFactor = 1,
		waitForSelector,
		waitForTimeout,
		clip,
		omitBackground = false,
	} = options;

	const browser = await puppeteer.launch(browserBinding);

	try {
		const page = await browser.newPage();

		await page.setViewport({
			width,
			height,
			deviceScaleFactor,
		});

		await page.goto(url, { waitUntil: "networkidle0" });

		if (waitForSelector) {
			await page.waitForSelector(waitForSelector);
		}

		if (waitForTimeout) {
			await new Promise((r) => setTimeout(r, waitForTimeout));
		}

		const screenshotOpts = buildScreenshotOptions(format, fullPage, omitBackground, quality, clip);
		const buffer = await page.screenshot(screenshotOpts);
		return new Uint8Array(buffer);
	} finally {
		await browser.close();
	}
}

/**
 * Generate a PDF from a URL
 *
 * @example
 * ```ts
 * const pdf = await generatePdf(env.BROWSER, "https://example.com/invoice", {
 *   format: "A4",
 *   printBackground: true,
 * });
 * ```
 */
export async function generatePdf(
	browserBinding: Fetcher,
	url: string,
	options: PdfOptions = {},
): Promise<Uint8Array> {
	const {
		format = "A4",
		landscape = false,
		printBackground = true,
		scale = 1,
		margin,
		headerTemplate,
		footerTemplate,
		displayHeaderFooter = false,
		waitForSelector,
	} = options;

	const browser = await puppeteer.launch(browserBinding);

	try {
		const page = await browser.newPage();

		await page.goto(url, { waitUntil: "networkidle0" });

		if (waitForSelector) {
			await page.waitForSelector(waitForSelector);
		}

		const pdfOpts = buildPdfOptions(
			format,
			landscape,
			printBackground,
			scale,
			displayHeaderFooter,
			margin,
			headerTemplate,
			footerTemplate,
		);
		const buffer = await page.pdf(pdfOpts);
		return new Uint8Array(buffer);
	} finally {
		await browser.close();
	}
}

/**
 * Scrape content from a URL
 *
 * @example
 * ```ts
 * const result = await scrapeContent(env.BROWSER, "https://example.com");
 * console.log(result.title, result.meta.description);
 * ```
 */
export async function scrapeContent(
	browserBinding: Fetcher,
	url: string,
	options: ScrapeOptions = {},
): Promise<ScrapeResult> {
	const {
		width = 1280,
		height = 720,
		waitForSelector,
		waitForTimeout,
		waitForNetworkIdle = true,
		userAgent,
	} = options;

	const browser = await puppeteer.launch(browserBinding);

	try {
		const page = await browser.newPage();

		await page.setViewport({ width, height });

		if (userAgent) {
			await page.setUserAgent(userAgent);
		}

		await page.goto(url, {
			waitUntil: waitForNetworkIdle ? "networkidle0" : "domcontentloaded",
		});

		if (waitForSelector) {
			await page.waitForSelector(waitForSelector);
		}

		if (waitForTimeout) {
			await new Promise((r) => setTimeout(r, waitForTimeout));
		}

		// page.evaluate runs in browser context where DOM APIs are available
		const result = await page.evaluate((): ScrapeResult => {
			const getMeta = (): Record<string, string> => {
				const meta: Record<string, string> = {};
				// @ts-expect-error - runs in browser context
				const metaElements = document.querySelectorAll("meta") as unknown as HTMLMetaElement[];
				for (const el of Array.from(metaElements)) {
					const name = el.getAttribute("name") || el.getAttribute("property");
					const content = el.getAttribute("content");
					if (name && content) {
						meta[name] = content;
					}
				}
				return meta;
			};

			const getLinks = (): Array<{ href: string; text: string }> => {
				const links: Array<{ href: string; text: string }> = [];
				// @ts-expect-error - runs in browser context
				const linkElements = document.querySelectorAll("a[href]") as unknown as HTMLAnchorElement[];
				for (const el of Array.from(linkElements)) {
					const href = el.getAttribute("href");
					if (href) {
						links.push({
							href,
							text: (el.textContent || "").trim(),
						});
					}
				}
				return links;
			};

			return {
				// @ts-expect-error - runs in browser context
				title: document.title as string,
				// @ts-expect-error - runs in browser context
				url: window.location.href as string,
				// @ts-expect-error - runs in browser context
				html: document.documentElement.outerHTML as string,
				// @ts-expect-error - runs in browser context
				text: document.body.innerText as string,
				meta: getMeta(),
				links: getLinks(),
			};
		});

		return result;
	} finally {
		await browser.close();
	}
}

// ============================================================================
// HTML Rendering
// ============================================================================

/**
 * Render HTML string to screenshot
 *
 * @example
 * ```ts
 * const html = "<h1>Hello World</h1>";
 * const png = await renderHtmlToImage(env.BROWSER, html, { width: 800 });
 * ```
 */
export async function renderHtmlToImage(
	browserBinding: Fetcher,
	html: string,
	options: ScreenshotOptions = {},
): Promise<Uint8Array> {
	const {
		width = 1280,
		height = 720,
		format = "png",
		quality = 80,
		deviceScaleFactor = 1,
		omitBackground = false,
	} = options;

	const browser = await puppeteer.launch(browserBinding);

	try {
		const page = await browser.newPage();

		await page.setViewport({
			width,
			height,
			deviceScaleFactor,
		});

		await page.setContent(html, { waitUntil: "networkidle0" });

		const screenshotOpts = buildScreenshotOptions(format, false, omitBackground, quality);
		const buffer = await page.screenshot(screenshotOpts);
		return new Uint8Array(buffer);
	} finally {
		await browser.close();
	}
}

/**
 * Render HTML string to PDF
 *
 * @example
 * ```ts
 * const html = "<h1>Invoice #123</h1><p>Total: $100</p>";
 * const pdf = await renderHtmlToPdf(env.BROWSER, html, { format: "A4" });
 * ```
 */
export async function renderHtmlToPdf(
	browserBinding: Fetcher,
	html: string,
	options: PdfOptions = {},
): Promise<Uint8Array> {
	const { format = "A4", landscape = false, printBackground = true, scale = 1, margin } = options;

	const browser = await puppeteer.launch(browserBinding);

	try {
		const page = await browser.newPage();

		await page.setContent(html, { waitUntil: "networkidle0" });

		const pdfOpts = buildPdfOptions(format, landscape, printBackground, scale, false, margin);
		const buffer = await page.pdf(pdfOpts);
		return new Uint8Array(buffer);
	} finally {
		await browser.close();
	}
}

// ============================================================================
// Browser Session
// ============================================================================

/**
 * Create a reusable browser session for multiple operations
 *
 * @example
 * ```ts
 * const session = await createBrowserSession(env.BROWSER);
 *
 * try {
 *   const page1 = await session.screenshot("https://example.com");
 *   const page2 = await session.screenshot("https://example.org");
 * } finally {
 *   await session.close();
 * }
 * ```
 */
export async function createBrowserSession(browserBinding: Fetcher) {
	const browser = await puppeteer.launch(browserBinding);

	return {
		/**
		 * Take a screenshot
		 */
		async screenshot(url: string, options?: ScreenshotOptions): Promise<Uint8Array> {
			const page = await browser.newPage();
			try {
				const {
					width = 1280,
					height = 720,
					fullPage = false,
					format = "png",
					quality = 80,
					deviceScaleFactor = 1,
					waitForSelector,
					waitForTimeout,
					clip,
					omitBackground = false,
				} = options || {};

				await page.setViewport({ width, height, deviceScaleFactor });
				await page.goto(url, { waitUntil: "networkidle0" });

				if (waitForSelector) await page.waitForSelector(waitForSelector);
				if (waitForTimeout) await new Promise((r) => setTimeout(r, waitForTimeout));

				const screenshotOpts = buildScreenshotOptions(
					format,
					fullPage,
					omitBackground,
					quality,
					clip,
				);
				const buffer = await page.screenshot(screenshotOpts);
				return new Uint8Array(buffer);
			} finally {
				await page.close();
			}
		},

		/**
		 * Generate a PDF
		 */
		async pdf(url: string, options?: PdfOptions): Promise<Uint8Array> {
			const page = await browser.newPage();
			try {
				const {
					format = "A4",
					landscape = false,
					printBackground = true,
					scale = 1,
					margin,
					waitForSelector,
				} = options || {};

				await page.goto(url, { waitUntil: "networkidle0" });
				if (waitForSelector) await page.waitForSelector(waitForSelector);

				const pdfOpts = buildPdfOptions(format, landscape, printBackground, scale, false, margin);
				const buffer = await page.pdf(pdfOpts);
				return new Uint8Array(buffer);
			} finally {
				await page.close();
			}
		},

		/**
		 * Get the underlying browser instance
		 */
		getBrowser(): Browser {
			return browser;
		},

		/**
		 * Close the browser session
		 */
		async close(): Promise<void> {
			await browser.close();
		},
	};
}

// ============================================================================
// OG Image Generator
// ============================================================================

/**
 * Generate Open Graph images from templates
 *
 * @example
 * ```ts
 * const og = createOgImageGenerator(env.BROWSER, {
 *   width: 1200,
 *   height: 630,
 * });
 *
 * const image = await og.generate({
 *   title: "My Blog Post",
 *   description: "A great article about...",
 *   author: "John Doe",
 * });
 * ```
 */
export function createOgImageGenerator(
	browserBinding: Fetcher,
	options: {
		width?: number;
		height?: number;
		template?: (data: Record<string, string>) => string;
	} = {},
) {
	const { width = 1200, height = 630, template = defaultOgTemplate } = options;

	return {
		/**
		 * Generate an OG image from data
		 */
		async generate(data: Record<string, string>): Promise<Uint8Array> {
			const html = template(data);
			return renderHtmlToImage(browserBinding, html, {
				width,
				height,
				format: "png",
			});
		},

		/**
		 * Generate from custom HTML
		 */
		async generateFromHtml(html: string): Promise<Uint8Array> {
			return renderHtmlToImage(browserBinding, html, {
				width,
				height,
				format: "png",
			});
		},
	};
}

/**
 * Default OG image template
 */
function defaultOgTemplate(data: Record<string, string>): string {
	const { title = "", description = "", author = "" } = data;

	return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
    }
    h1 {
      font-size: 64px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 24px;
    }
    p {
      font-size: 28px;
      opacity: 0.9;
      line-height: 1.4;
      margin-bottom: 32px;
    }
    .author {
      font-size: 24px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${description ? `<p>${escapeHtml(description)}</p>` : ""}
  ${author ? `<div class="author">By ${escapeHtml(author)}</div>` : ""}
</body>
</html>
  `.trim();
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
