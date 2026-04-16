/**
 * @repo/media - Cloudflare Media utilities
 *
 * Image transformation and browser rendering for Workers.
 *
 * @example Images
 * ```ts
 * import { transformImage, ImagePresets } from "@repo/media/images";
 *
 * const response = await transformImage(imageUrl, { width: 800, format: "webp" });
 * const thumbnail = await ImagePresets.thumbnail.transform(imageUrl);
 * ```
 *
 * @example Browser Rendering
 * ```ts
 * import { screenshot, generatePdf } from "@repo/media/browser";
 *
 * const png = await screenshot(env.BROWSER, "https://example.com");
 * const pdf = await generatePdf(env.BROWSER, "https://example.com/invoice");
 * ```
 */

export * from "./browser/index.js";
// Re-export all modules
export * from "./images/index.js";
