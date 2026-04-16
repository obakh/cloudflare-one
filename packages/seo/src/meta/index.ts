/**
 * SEO Meta Tag Helpers
 *
 * Utilities for generating meta tags for SEO, Open Graph, and Twitter Cards.
 */

/**
 * Basic meta tag configuration
 */
export interface MetaConfig {
	/** Page title */
	title: string;
	/** Page description (recommended: 150-160 characters) */
	description: string;
	/** Canonical URL */
	url?: string;
	/** Site name */
	siteName?: string;
	/** Locale (e.g., "en_US") */
	locale?: string;
	/** Page type */
	type?: "website" | "article" | "product" | "profile";
	/** Primary image URL */
	image?: string;
	/** Image alt text */
	imageAlt?: string;
	/** Image dimensions */
	imageWidth?: number;
	imageHeight?: number;
	/** Twitter card type */
	twitterCard?: "summary" | "summary_large_image" | "app" | "player";
	/** Twitter handle (e.g., "@username") */
	twitterSite?: string;
	/** Twitter creator handle */
	twitterCreator?: string;
	/** Robots directives */
	robots?: string;
	/** Keywords (comma-separated) */
	keywords?: string;
	/** Author name */
	author?: string;
	/** Theme color */
	themeColor?: string;
}

/**
 * Article-specific meta configuration
 */
export interface ArticleMetaConfig extends MetaConfig {
	type: "article";
	/** Published date (ISO 8601) */
	publishedTime?: string;
	/** Modified date (ISO 8601) */
	modifiedTime?: string;
	/** Article author */
	articleAuthor?: string;
	/** Article section/category */
	articleSection?: string;
	/** Article tags */
	articleTags?: string[];
}

/**
 * Product-specific meta configuration
 */
export interface ProductMetaConfig extends MetaConfig {
	type: "product";
	/** Product price */
	price?: string;
	/** Currency (e.g., "USD") */
	currency?: string;
	/** Availability */
	availability?: "in stock" | "out of stock" | "preorder";
}

/**
 * Meta tag object
 */
export interface MetaTag {
	name?: string;
	property?: string;
	content: string;
	httpEquiv?: string;
}

/**
 * Generate meta tags from configuration
 *
 * @example
 * ```ts
 * import { generateMetaTags } from "@repo/seo/meta";
 *
 * const tags = generateMetaTags({
 *   title: "My Page",
 *   description: "Page description",
 *   url: "https://example.com/page",
 *   image: "https://example.com/og.jpg",
 *   twitterCard: "summary_large_image",
 * });
 * ```
 */
export function generateMetaTags(
	config: MetaConfig | ArticleMetaConfig | ProductMetaConfig,
): MetaTag[] {
	const tags: MetaTag[] = [];

	// Basic meta tags
	if (config.description) {
		tags.push({ name: "description", content: config.description });
	}
	if (config.keywords) {
		tags.push({ name: "keywords", content: config.keywords });
	}
	if (config.author) {
		tags.push({ name: "author", content: config.author });
	}
	if (config.robots) {
		tags.push({ name: "robots", content: config.robots });
	}
	if (config.themeColor) {
		tags.push({ name: "theme-color", content: config.themeColor });
	}

	// Open Graph tags
	tags.push({ property: "og:title", content: config.title });
	if (config.description) {
		tags.push({ property: "og:description", content: config.description });
	}
	if (config.url) {
		tags.push({ property: "og:url", content: config.url });
	}
	if (config.siteName) {
		tags.push({ property: "og:site_name", content: config.siteName });
	}
	if (config.locale) {
		tags.push({ property: "og:locale", content: config.locale });
	}
	tags.push({ property: "og:type", content: config.type || "website" });

	// Image tags
	if (config.image) {
		tags.push({ property: "og:image", content: config.image });
		if (config.imageAlt) {
			tags.push({ property: "og:image:alt", content: config.imageAlt });
		}
		if (config.imageWidth) {
			tags.push({ property: "og:image:width", content: String(config.imageWidth) });
		}
		if (config.imageHeight) {
			tags.push({ property: "og:image:height", content: String(config.imageHeight) });
		}
	}

	// Twitter Card tags
	tags.push({ name: "twitter:card", content: config.twitterCard || "summary" });
	tags.push({ name: "twitter:title", content: config.title });
	if (config.description) {
		tags.push({ name: "twitter:description", content: config.description });
	}
	if (config.image) {
		tags.push({ name: "twitter:image", content: config.image });
		if (config.imageAlt) {
			tags.push({ name: "twitter:image:alt", content: config.imageAlt });
		}
	}
	if (config.twitterSite) {
		tags.push({ name: "twitter:site", content: config.twitterSite });
	}
	if (config.twitterCreator) {
		tags.push({ name: "twitter:creator", content: config.twitterCreator });
	}

	// Article-specific tags
	if (config.type === "article") {
		const articleConfig = config as ArticleMetaConfig;
		if (articleConfig.publishedTime) {
			tags.push({ property: "article:published_time", content: articleConfig.publishedTime });
		}
		if (articleConfig.modifiedTime) {
			tags.push({ property: "article:modified_time", content: articleConfig.modifiedTime });
		}
		if (articleConfig.articleAuthor) {
			tags.push({ property: "article:author", content: articleConfig.articleAuthor });
		}
		if (articleConfig.articleSection) {
			tags.push({ property: "article:section", content: articleConfig.articleSection });
		}
		if (articleConfig.articleTags) {
			for (const tag of articleConfig.articleTags) {
				tags.push({ property: "article:tag", content: tag });
			}
		}
	}

	// Product-specific tags
	if (config.type === "product") {
		const productConfig = config as ProductMetaConfig;
		if (productConfig.price) {
			tags.push({ property: "product:price:amount", content: productConfig.price });
		}
		if (productConfig.currency) {
			tags.push({ property: "product:price:currency", content: productConfig.currency });
		}
		if (productConfig.availability) {
			tags.push({ property: "product:availability", content: productConfig.availability });
		}
	}

	return tags;
}

/**
 * Generate HTML string for meta tags
 *
 * @example
 * ```ts
 * const html = generateMetaTagsHTML({
 *   title: "My Page",
 *   description: "Page description",
 * });
 * // '<meta name="description" content="Page description">...'
 * ```
 */
export function generateMetaTagsHTML(
	config: MetaConfig | ArticleMetaConfig | ProductMetaConfig,
): string {
	const tags = generateMetaTags(config);

	return tags
		.map((tag) => {
			const attrs: string[] = [];
			if (tag.name) attrs.push(`name="${escapeHtml(tag.name)}"`);
			if (tag.property) attrs.push(`property="${escapeHtml(tag.property)}"`);
			if (tag.httpEquiv) attrs.push(`http-equiv="${escapeHtml(tag.httpEquiv)}"`);
			attrs.push(`content="${escapeHtml(tag.content)}"`);
			return `<meta ${attrs.join(" ")}>`;
		})
		.join("\n");
}

/**
 * Generate canonical link tag
 */
export function generateCanonicalTag(url: string): string {
	return `<link rel="canonical" href="${escapeHtml(url)}">`;
}

/**
 * Generate alternate language tags (hreflang)
 *
 * @example
 * ```ts
 * const html = generateHreflangTags({
 *   "en": "https://example.com/en/page",
 *   "es": "https://example.com/es/page",
 *   "x-default": "https://example.com/page",
 * });
 * ```
 */
export function generateHreflangTags(alternates: Record<string, string>): string {
	return Object.entries(alternates)
		.map(
			([lang, url]) =>
				`<link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(url)}">`,
		)
		.join("\n");
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Truncate description to recommended length
 */
export function truncateDescription(text: string, maxLength = 160): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 3).trim()}...`;
}

/**
 * Generate title with site name
 */
export function formatTitle(title: string, siteName?: string, separator = " | "): string {
	if (!siteName) return title;
	return `${title}${separator}${siteName}`;
}
