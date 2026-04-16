/**
 * JSON-LD Structured Data Helpers
 *
 * Generate structured data for search engines using schema.org vocabulary.
 *
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

import type {
	Article,
	BreadcrumbList,
	Event,
	FAQPage,
	LocalBusiness,
	Organization,
	Product,
	Thing,
	WebSite,
	WithContext,
} from "schema-dts";

// Re-export schema-dts types for convenience
export type {
	Article,
	BreadcrumbList,
	Event,
	FAQPage,
	LocalBusiness,
	Organization,
	Product,
	Thing,
	WebSite,
	WithContext,
} from "schema-dts";

/**
 * Escape JSON for safe HTML embedding
 */
function escapeJsonForHtml(json: string): string {
	return json
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

/**
 * Generate JSON-LD script tag HTML
 *
 * @example
 * ```ts
 * import { generateJsonLdScript } from "@repo/seo/json-ld";
 *
 * const script = generateJsonLdScript({
 *   "@context": "https://schema.org",
 *   "@type": "Organization",
 *   name: "My Company",
 *   url: "https://example.com",
 * });
 * ```
 */
export function generateJsonLdScript<T extends Thing>(data: WithContext<T>): string {
	const json = escapeJsonForHtml(JSON.stringify(data));
	return `<script type="application/ld+json">${json}</script>`;
}

/**
 * React component for JSON-LD
 *
 * @example
 * ```tsx
 * import { JsonLd } from "@repo/seo/json-ld";
 *
 * <JsonLd data={{
 *   "@context": "https://schema.org",
 *   "@type": "Organization",
 *   name: "My Company",
 * }} />
 * ```
 */
export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: escapeJsonForHtml(JSON.stringify(data)),
			}}
		/>
	);
}

/**
 * Create Organization schema
 *
 * @example
 * ```ts
 * const org = createOrganization({
 *   name: "My Company",
 *   url: "https://example.com",
 *   logo: "https://example.com/logo.png",
 *   sameAs: [
 *     "https://twitter.com/mycompany",
 *     "https://linkedin.com/company/mycompany",
 *   ],
 * });
 * ```
 */
export function createOrganization(config: {
	name: string;
	url: string;
	logo?: string;
	description?: string;
	email?: string;
	telephone?: string;
	sameAs?: string[];
	address?: {
		streetAddress?: string;
		addressLocality?: string;
		addressRegion?: string;
		postalCode?: string;
		addressCountry?: string;
	};
}): WithContext<Organization> {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: config.name,
		url: config.url,
		...(config.logo && { logo: config.logo }),
		...(config.description && { description: config.description }),
		...(config.email && { email: config.email }),
		...(config.telephone && { telephone: config.telephone }),
		...(config.sameAs && { sameAs: config.sameAs }),
		...(config.address && {
			address: {
				"@type": "PostalAddress",
				...config.address,
			},
		}),
	};
}

/**
 * Create WebSite schema with search action
 *
 * @example
 * ```ts
 * const website = createWebSite({
 *   name: "My Site",
 *   url: "https://example.com",
 *   searchUrl: "https://example.com/search?q={search_term_string}",
 * });
 * ```
 */
export function createWebSite(config: {
	name: string;
	url: string;
	description?: string;
	searchUrl?: string;
}): WithContext<WebSite> {
	const base: WithContext<WebSite> = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: config.name,
		url: config.url,
		...(config.description && { description: config.description }),
	};

	if (config.searchUrl) {
		(base as any).potentialAction = {
			"@type": "SearchAction",
			target: config.searchUrl,
			"query-input": "required name=search_term_string",
		};
	}

	return base;
}

/**
 * Create Article schema
 *
 * @example
 * ```ts
 * const article = createArticle({
 *   headline: "My Article Title",
 *   description: "Article description",
 *   image: "https://example.com/article.jpg",
 *   datePublished: "2024-01-15",
 *   author: { name: "John Doe", url: "https://example.com/author/john" },
 * });
 * ```
 */
export function createArticle(config: {
	headline: string;
	description?: string;
	image?: string | string[];
	datePublished: string;
	dateModified?: string;
	author: { name: string; url?: string } | Array<{ name: string; url?: string }>;
	publisher?: { name: string; logo?: string };
	url?: string;
	mainEntityOfPage?: string;
}): WithContext<Article> {
	const authors = Array.isArray(config.author) ? config.author : [config.author];

	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: config.headline,
		...(config.description && { description: config.description }),
		...(config.image && { image: config.image }),
		datePublished: config.datePublished,
		...(config.dateModified && { dateModified: config.dateModified }),
		author: authors.map((a) => ({
			"@type": "Person" as const,
			name: a.name,
			...(a.url && { url: a.url }),
		})),
		...(config.publisher && {
			publisher: {
				"@type": "Organization",
				name: config.publisher.name,
				...(config.publisher.logo && {
					logo: {
						"@type": "ImageObject",
						url: config.publisher.logo,
					},
				}),
			},
		}),
		...(config.url && { url: config.url }),
		...(config.mainEntityOfPage && { mainEntityOfPage: config.mainEntityOfPage }),
	};
}

/**
 * Create Product schema
 *
 * @example
 * ```ts
 * const product = createProduct({
 *   name: "Product Name",
 *   description: "Product description",
 *   image: "https://example.com/product.jpg",
 *   price: 29.99,
 *   currency: "USD",
 *   availability: "InStock",
 *   brand: "Brand Name",
 * });
 * ```
 */
export function createProduct(config: {
	name: string;
	description?: string;
	image?: string | string[];
	price: number;
	currency: string;
	availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
	brand?: string;
	sku?: string;
	url?: string;
	reviewCount?: number;
	ratingValue?: number;
}): WithContext<Product> {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: config.name,
		...(config.description && { description: config.description }),
		...(config.image && { image: config.image }),
		...(config.brand && {
			brand: {
				"@type": "Brand",
				name: config.brand,
			},
		}),
		...(config.sku && { sku: config.sku }),
		...(config.url && { url: config.url }),
		offers: {
			"@type": "Offer",
			price: config.price,
			priceCurrency: config.currency,
			availability: config.availability
				? `https://schema.org/${config.availability}`
				: "https://schema.org/InStock",
		},
		...(config.ratingValue &&
			config.reviewCount && {
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: config.ratingValue,
					reviewCount: config.reviewCount,
				},
			}),
	};
}

/**
 * Create BreadcrumbList schema
 *
 * @example
 * ```ts
 * const breadcrumbs = createBreadcrumbs([
 *   { name: "Home", url: "https://example.com" },
 *   { name: "Products", url: "https://example.com/products" },
 *   { name: "Widget", url: "https://example.com/products/widget" },
 * ]);
 * ```
 */
export function createBreadcrumbs(
	items: Array<{ name: string; url: string }>,
): WithContext<BreadcrumbList> {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}

/**
 * Create FAQPage schema
 *
 * @example
 * ```ts
 * const faq = createFAQPage([
 *   { question: "What is this?", answer: "This is a product." },
 *   { question: "How does it work?", answer: "It works like magic." },
 * ]);
 * ```
 */
export function createFAQPage(
	items: Array<{ question: string; answer: string }>,
): WithContext<FAQPage> {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: items.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: item.answer,
			},
		})),
	};
}

/**
 * Create LocalBusiness schema
 *
 * @example
 * ```ts
 * const business = createLocalBusiness({
 *   name: "My Restaurant",
 *   address: {
 *     streetAddress: "123 Main St",
 *     addressLocality: "City",
 *     addressRegion: "State",
 *     postalCode: "12345",
 *     addressCountry: "US",
 *   },
 *   telephone: "+1-555-555-5555",
 *   openingHours: ["Mo-Fr 09:00-17:00", "Sa 10:00-14:00"],
 * });
 * ```
 */
export function createLocalBusiness(config: {
	name: string;
	description?: string;
	image?: string;
	url?: string;
	telephone?: string;
	email?: string;
	address: {
		streetAddress: string;
		addressLocality: string;
		addressRegion?: string;
		postalCode: string;
		addressCountry: string;
	};
	geo?: { latitude: number; longitude: number };
	openingHours?: string[];
	priceRange?: string;
}): WithContext<LocalBusiness> {
	const base: any = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		name: config.name,
		...(config.description && { description: config.description }),
		...(config.image && { image: config.image }),
		...(config.url && { url: config.url }),
		...(config.telephone && { telephone: config.telephone }),
		...(config.email && { email: config.email }),
		address: {
			"@type": "PostalAddress",
			...config.address,
		},
		...(config.geo && {
			geo: {
				"@type": "GeoCoordinates",
				latitude: config.geo.latitude,
				longitude: config.geo.longitude,
			},
		}),
		...(config.priceRange && { priceRange: config.priceRange }),
	};

	// openingHours as simple strings (schema.org accepts this format)
	if (config.openingHours) {
		base.openingHours = config.openingHours;
	}

	return base as WithContext<LocalBusiness>;
}

/**
 * Create Event schema
 */
export function createEvent(config: {
	name: string;
	description?: string;
	startDate: string;
	endDate?: string;
	location?:
		| {
				name: string;
				address: string;
		  }
		| { url: string };
	image?: string;
	url?: string;
	performer?: { name: string };
	organizer?: { name: string; url?: string };
	offers?: {
		price: number;
		currency: string;
		url?: string;
		availability?: "InStock" | "SoldOut" | "PreOrder";
	};
}): WithContext<Event> {
	return {
		"@context": "https://schema.org",
		"@type": "Event",
		name: config.name,
		...(config.description && { description: config.description }),
		startDate: config.startDate,
		...(config.endDate && { endDate: config.endDate }),
		...(config.location && {
			location:
				"url" in config.location
					? { "@type": "VirtualLocation", url: config.location.url }
					: {
							"@type": "Place",
							name: config.location.name,
							address: config.location.address,
						},
		}),
		...(config.image && { image: config.image }),
		...(config.url && { url: config.url }),
		...(config.performer && {
			performer: { "@type": "Person", name: config.performer.name },
		}),
		...(config.organizer && {
			organizer: {
				"@type": "Organization",
				name: config.organizer.name,
				...(config.organizer.url && { url: config.organizer.url }),
			},
		}),
		...(config.offers && {
			offers: {
				"@type": "Offer",
				price: config.offers.price,
				priceCurrency: config.offers.currency,
				...(config.offers.url && { url: config.offers.url }),
				availability: config.offers.availability
					? `https://schema.org/${config.offers.availability}`
					: undefined,
			},
		}),
	};
}
