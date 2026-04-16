/**
 * @repo/i18n - Internationalization helpers for Cloudflare Workers
 *
 * Provides locale detection, HTMLRewriter-based translation,
 * and translation string management utilities.
 *
 * @example
 * ```ts
 * // Locale detection
 * import { detectLocale, LOCALES } from "@repo/i18n/locale";
 *
 * // Translation
 * import { createTranslator, interpolate } from "@repo/i18n/translator";
 * ```
 */

// Re-export locale detection
export {
	COUNTRY_LOCALE_MAP,
	createLocaleCookie,
	detectLocale,
	getGeoData,
	getLocaleFromCookie,
	getLocaleFromQuery,
	LOCALES,
	type LocaleDetectionOptions,
	type LocaleDetectionResult,
	matchLocale,
	type ParsedLocale,
	parseAcceptLanguage,
} from "./locale/index.js";

// Re-export translator
export {
	createNamespacedT,
	createTranslator,
	extractKeys,
	findMissingTranslations,
	interpolate,
	mergeTranslations,
	pluralize,
	type TranslationDictionary,
	type Translations,
	type TranslatorOptions,
} from "./translator/index.js";
