/**
 * Locale Detection Helpers for Cloudflare Workers
 *
 * Utilities for detecting user locale from Accept-Language header,
 * cf.country, and other sources.
 *
 * @see https://developers.cloudflare.com/workers/examples/localize-a-website/
 */

/**
 * Common locale codes
 */
export const LOCALES = {
	ENGLISH: "en",
	ENGLISH_US: "en-US",
	ENGLISH_GB: "en-GB",
	SPANISH: "es",
	FRENCH: "fr",
	GERMAN: "de",
	ITALIAN: "it",
	PORTUGUESE: "pt",
	PORTUGUESE_BR: "pt-BR",
	CHINESE: "zh",
	CHINESE_SIMPLIFIED: "zh-CN",
	CHINESE_TRADITIONAL: "zh-TW",
	JAPANESE: "ja",
	KOREAN: "ko",
	ARABIC: "ar",
	RUSSIAN: "ru",
	DUTCH: "nl",
	POLISH: "pl",
	TURKISH: "tr",
	HINDI: "hi",
} as const;

/**
 * Country to default locale mapping
 */
export const COUNTRY_LOCALE_MAP: Record<string, string> = {
	US: "en-US",
	GB: "en-GB",
	AU: "en-AU",
	CA: "en-CA",
	ES: "es",
	MX: "es-MX",
	AR: "es-AR",
	FR: "fr",
	DE: "de",
	AT: "de-AT",
	CH: "de-CH",
	IT: "it",
	PT: "pt",
	BR: "pt-BR",
	CN: "zh-CN",
	TW: "zh-TW",
	HK: "zh-HK",
	JP: "ja",
	KR: "ko",
	SA: "ar",
	AE: "ar",
	RU: "ru",
	NL: "nl",
	BE: "nl-BE",
	PL: "pl",
	TR: "tr",
	IN: "hi",
};

/**
 * Parsed locale with quality value
 */
export interface ParsedLocale {
	locale: string;
	language: string;
	region?: string;
	quality: number;
}

/**
 * Locale detection options
 */
export interface LocaleDetectionOptions {
	/** Supported locales (first is default) */
	supportedLocales: string[];
	/** Default locale if none detected */
	defaultLocale?: string;
	/** Cookie name for locale preference */
	cookieName?: string;
	/** Query parameter name for locale override */
	queryParam?: string;
	/** Use cf.country as fallback */
	useCountryFallback?: boolean;
}

/**
 * Locale detection result
 */
export interface LocaleDetectionResult {
	/** Detected locale */
	locale: string;
	/** Detection source */
	source: "cookie" | "query" | "header" | "country" | "default";
	/** User's country (from cf) */
	country?: string;
	/** User's timezone (from cf) */
	timezone?: string;
}

/**
 * Parse Accept-Language header
 *
 * @example
 * ```ts
 * const locales = parseAcceptLanguage("en-US,en;q=0.9,es;q=0.8");
 * // [
 * //   { locale: "en-US", language: "en", region: "US", quality: 1 },
 * //   { locale: "en", language: "en", quality: 0.9 },
 * //   { locale: "es", language: "es", quality: 0.8 }
 * // ]
 * ```
 */
export function parseAcceptLanguage(header: string | null): ParsedLocale[] {
	if (!header) return [];

	return header
		.split(",")
		.map((part) => {
			const [locale, qualityStr] = part.trim().split(";q=");
			const quality = qualityStr ? parseFloat(qualityStr) : 1;
			const [language, region] = locale.split("-");

			return {
				locale: locale.trim(),
				language: language.toLowerCase(),
				region: region?.toUpperCase(),
				quality,
			};
		})
		.filter((l) => !Number.isNaN(l.quality))
		.sort((a, b) => b.quality - a.quality);
}

/**
 * Get the best matching locale from supported locales
 *
 * @example
 * ```ts
 * const match = matchLocale(
 *   parseAcceptLanguage("en-US,en;q=0.9,es;q=0.8"),
 *   ["en", "es", "fr"]
 * );
 * // "en"
 * ```
 */
export function matchLocale(parsed: ParsedLocale[], supportedLocales: string[]): string | null {
	const supported = new Set(supportedLocales.map((l) => l.toLowerCase()));
	const supportedLanguages = new Set(supportedLocales.map((l) => l.split("-")[0].toLowerCase()));

	for (const { locale, language } of parsed) {
		// Exact match (e.g., "en-US" matches "en-US")
		if (supported.has(locale.toLowerCase())) {
			return locale;
		}
		// Language match (e.g., "en-US" matches "en")
		if (supported.has(language)) {
			return language;
		}
		// Find any supported locale with same language
		if (supportedLanguages.has(language)) {
			const match = supportedLocales.find((l) => l.split("-")[0].toLowerCase() === language);
			if (match) return match;
		}
	}

	return null;
}

/**
 * Get locale from cookie
 */
export function getLocaleFromCookie(request: Request, cookieName: string): string | null {
	const cookie = request.headers.get("Cookie");
	if (!cookie) return null;

	const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
	return match ? match[1] : null;
}

/**
 * Get locale from query parameter
 */
export function getLocaleFromQuery(request: Request, paramName: string): string | null {
	const url = new URL(request.url);
	return url.searchParams.get(paramName);
}

/**
 * Get geolocation data from Cloudflare request
 *
 * @example
 * ```ts
 * const geo = getGeoData(request);
 * console.log(geo.country); // "US"
 * console.log(geo.timezone); // "America/New_York"
 * ```
 */
export function getGeoData(request: Request): {
	country?: string;
	timezone?: string;
	city?: string;
	region?: string;
	continent?: string;
	latitude?: string;
	longitude?: string;
} {
	const cf = (request as any).cf as IncomingRequestCfProperties | undefined;

	return {
		country: cf?.country,
		timezone: cf?.timezone,
		city: cf?.city,
		region: cf?.region,
		continent: cf?.continent,
		latitude: cf?.latitude,
		longitude: cf?.longitude,
	};
}

/**
 * Detect user locale from request
 *
 * Priority: cookie > query param > Accept-Language > country > default
 *
 * @example
 * ```ts
 * import { detectLocale } from "@repo/i18n/locale";
 *
 * const result = detectLocale(request, {
 *   supportedLocales: ["en", "es", "fr", "de"],
 *   defaultLocale: "en",
 *   cookieName: "locale",
 *   queryParam: "lang",
 *   useCountryFallback: true,
 * });
 *
 * console.log(result.locale);  // "es"
 * console.log(result.source);  // "header"
 * console.log(result.country); // "MX"
 * ```
 */
export function detectLocale(
	request: Request,
	options: LocaleDetectionOptions,
): LocaleDetectionResult {
	const {
		supportedLocales,
		defaultLocale = supportedLocales[0],
		cookieName = "locale",
		queryParam = "lang",
		useCountryFallback = true,
	} = options;

	const geo = getGeoData(request);
	const supported = new Set(supportedLocales.map((l) => l.toLowerCase()));

	// 1. Check cookie
	const cookieLocale = getLocaleFromCookie(request, cookieName);
	if (cookieLocale && supported.has(cookieLocale.toLowerCase())) {
		return {
			locale: cookieLocale,
			source: "cookie",
			country: geo.country,
			timezone: geo.timezone,
		};
	}

	// 2. Check query parameter
	const queryLocale = getLocaleFromQuery(request, queryParam);
	if (queryLocale && supported.has(queryLocale.toLowerCase())) {
		return {
			locale: queryLocale,
			source: "query",
			country: geo.country,
			timezone: geo.timezone,
		};
	}

	// 3. Check Accept-Language header
	const acceptLanguage = request.headers.get("Accept-Language");
	const parsed = parseAcceptLanguage(acceptLanguage);
	const headerMatch = matchLocale(parsed, supportedLocales);
	if (headerMatch) {
		return {
			locale: headerMatch,
			source: "header",
			country: geo.country,
			timezone: geo.timezone,
		};
	}

	// 4. Use country fallback
	if (useCountryFallback && geo.country) {
		const countryLocale = COUNTRY_LOCALE_MAP[geo.country];
		if (countryLocale) {
			// Check if exact match or language match
			if (supported.has(countryLocale.toLowerCase())) {
				return {
					locale: countryLocale,
					source: "country",
					country: geo.country,
					timezone: geo.timezone,
				};
			}
			// Try language only
			const language = countryLocale.split("-")[0];
			if (supported.has(language.toLowerCase())) {
				return {
					locale: language,
					source: "country",
					country: geo.country,
					timezone: geo.timezone,
				};
			}
		}
	}

	// 5. Default
	return {
		locale: defaultLocale,
		source: "default",
		country: geo.country,
		timezone: geo.timezone,
	};
}

/**
 * Create a Set-Cookie header for locale preference
 *
 * @example
 * ```ts
 * const cookie = createLocaleCookie("es", { maxAge: 365 * 24 * 60 * 60 });
 * response.headers.set("Set-Cookie", cookie);
 * ```
 */
export function createLocaleCookie(
	locale: string,
	options: {
		cookieName?: string;
		maxAge?: number;
		path?: string;
		sameSite?: "Strict" | "Lax" | "None";
		secure?: boolean;
	} = {},
): string {
	const {
		cookieName = "locale",
		maxAge = 365 * 24 * 60 * 60, // 1 year
		path = "/",
		sameSite = "Lax",
		secure = true,
	} = options;

	const parts = [
		`${cookieName}=${locale}`,
		`Max-Age=${maxAge}`,
		`Path=${path}`,
		`SameSite=${sameSite}`,
	];

	if (secure) {
		parts.push("Secure");
	}

	return parts.join("; ");
}
