/**
 * @repo/seo - SEO utilities for Cloudflare Workers
 *
 * Provides meta tag generation, JSON-LD structured data,
 * bot detection, and prerendering helpers.
 *
 * @example
 * ```ts
 * // Meta tags
 * import { generateMetaTags, generateMetaTagsHTML } from "@repo/seo/meta";
 *
 * // JSON-LD structured data
 * import { JsonLd, createArticle, createProduct } from "@repo/seo/json-ld";
 *
 * // Bot detection
 * import { detectBot, shouldPrerender } from "@repo/seo/bots";
 *
 * // Prerendering
 * import { createPrerenderMiddleware } from "@repo/seo/prerender";
 * ```
 */

// Re-export bot detection
export {
	ALL_BOTS,
	type BotDetectionOptions,
	type BotDetectionResult,
	createBotDetector,
	detectBot,
	isBot,
	isSearchEngine,
	isSocialBot,
	SEARCH_ENGINE_BOTS,
	SOCIAL_BOTS,
	shouldPrerender,
	verifyGooglebot,
	wantsHtml,
} from "./bots/index.js";

// Re-export JSON-LD helpers
export {
	createArticle,
	createBreadcrumbs,
	createEvent,
	createFAQPage,
	createLocalBusiness,
	createOrganization,
	createProduct,
	createWebSite,
	generateJsonLdScript,
	JsonLd,
} from "./json-ld/index.js";
// Re-export meta helpers
export {
	type ArticleMetaConfig,
	formatTitle,
	generateCanonicalTag,
	generateHreflangTags,
	generateMetaTags,
	generateMetaTagsHTML,
	type MetaConfig,
	type MetaTag,
	type ProductMetaConfig,
	truncateDescription,
} from "./meta/index.js";

// Re-export prerender helpers
export {
	createPrerenderMiddleware,
	handlePrerender,
	injectMetaTags,
	type PrerenderConfig,
	type PrerenderResult,
} from "./prerender/index.js";
