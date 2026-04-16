/**
 * Translation Helpers for Cloudflare Workers
 *
 * HTMLRewriter-based translation and string management utilities.
 *
 * @see https://developers.cloudflare.com/workers/examples/localize-a-website/
 */

/**
 * Translation dictionary type
 */
export type TranslationDictionary = Record<string, string>;

/**
 * Translations for multiple locales
 */
export type Translations = Record<string, TranslationDictionary>;

/**
 * Translation options
 */
export interface TranslatorOptions {
	/** All translations keyed by locale */
	translations: Translations;
	/** Default locale for fallback */
	defaultLocale: string;
	/** Attribute to look for translation keys (default: "data-i18n") */
	attribute?: string;
	/** Attribute for placeholder translations (default: "data-i18n-placeholder") */
	placeholderAttribute?: string;
	/** Attribute for title translations (default: "data-i18n-title") */
	titleAttribute?: string;
	/** Attribute for alt text translations (default: "data-i18n-alt") */
	altAttribute?: string;
}

/**
 * Create a translator instance
 *
 * @example
 * ```ts
 * import { createTranslator } from "@repo/i18n/translator";
 *
 * const translator = createTranslator({
 *   translations: {
 *     en: { "welcome": "Welcome!", "goodbye": "Goodbye!" },
 *     es: { "welcome": "¡Bienvenido!", "goodbye": "¡Adiós!" },
 *   },
 *   defaultLocale: "en",
 * });
 *
 * // Get a translation
 * const text = translator.t("welcome", "es"); // "¡Bienvenido!"
 *
 * // Transform HTML response
 * const response = translator.transform(originalResponse, "es");
 * ```
 */
export function createTranslator(options: TranslatorOptions) {
	const {
		translations,
		defaultLocale,
		attribute = "data-i18n",
		placeholderAttribute = "data-i18n-placeholder",
		titleAttribute = "data-i18n-title",
		altAttribute = "data-i18n-alt",
	} = options;

	/**
	 * Get translation for a key
	 */
	function t(key: string, locale: string): string {
		return translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? key;
	}

	/**
	 * Get all translations for a locale
	 */
	function getTranslations(locale: string): TranslationDictionary {
		return {
			...translations[defaultLocale],
			...translations[locale],
		};
	}

	/**
	 * Check if a locale is supported
	 */
	function isSupported(locale: string): boolean {
		return locale in translations;
	}

	/**
	 * Get list of supported locales
	 */
	function getSupportedLocales(): string[] {
		return Object.keys(translations);
	}

	/**
	 * HTMLRewriter handler for translating elements
	 */
	class TranslationHandler implements HTMLRewriterElementContentHandlers {
		private locale: string;

		constructor(locale: string) {
			this.locale = locale;
		}

		element(element: Element) {
			// Translate text content
			const key = element.getAttribute(attribute);
			if (key) {
				element.setInnerContent(t(key, this.locale));
				element.removeAttribute(attribute);
			}

			// Translate placeholder
			const placeholderKey = element.getAttribute(placeholderAttribute);
			if (placeholderKey) {
				element.setAttribute("placeholder", t(placeholderKey, this.locale));
				element.removeAttribute(placeholderAttribute);
			}

			// Translate title
			const titleKey = element.getAttribute(titleAttribute);
			if (titleKey) {
				element.setAttribute("title", t(titleKey, this.locale));
				element.removeAttribute(titleAttribute);
			}

			// Translate alt text
			const altKey = element.getAttribute(altAttribute);
			if (altKey) {
				element.setAttribute("alt", t(altKey, this.locale));
				element.removeAttribute(altAttribute);
			}
		}
	}

	/**
	 * Transform HTML response with translations
	 *
	 * @example
	 * ```html
	 * <!-- Input HTML -->
	 * <h1 data-i18n="welcome"></h1>
	 * <input data-i18n-placeholder="search_placeholder" />
	 *
	 * <!-- Output HTML (locale: es) -->
	 * <h1>¡Bienvenido!</h1>
	 * <input placeholder="Buscar..." />
	 * ```
	 */
	function transform(response: Response, locale: string): Response {
		const handler = new TranslationHandler(locale);

		return new HTMLRewriter()
			.on(`[${attribute}]`, handler)
			.on(`[${placeholderAttribute}]`, handler)
			.on(`[${titleAttribute}]`, handler)
			.on(`[${altAttribute}]`, handler)
			.transform(response);
	}

	/**
	 * Set the lang attribute on the html element
	 */
	function setHtmlLang(response: Response, locale: string): Response {
		return new HTMLRewriter()
			.on("html", {
				element(element) {
					element.setAttribute("lang", locale);
				},
			})
			.transform(response);
	}

	/**
	 * Full transformation: translate content + set lang attribute
	 */
	function transformFull(response: Response, locale: string): Response {
		const handler = new TranslationHandler(locale);

		return new HTMLRewriter()
			.on("html", {
				element(element) {
					element.setAttribute("lang", locale);
				},
			})
			.on(`[${attribute}]`, handler)
			.on(`[${placeholderAttribute}]`, handler)
			.on(`[${titleAttribute}]`, handler)
			.on(`[${altAttribute}]`, handler)
			.transform(response);
	}

	return {
		t,
		getTranslations,
		isSupported,
		getSupportedLocales,
		transform,
		setHtmlLang,
		transformFull,
	};
}

/**
 * Interpolate variables in a translation string
 *
 * @example
 * ```ts
 * const result = interpolate("Hello, {name}!", { name: "World" });
 * // "Hello, World!"
 *
 * const result = interpolate("You have {count} messages", { count: 5 });
 * // "You have 5 messages"
 * ```
 */
export function interpolate(template: string, variables: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, key) => {
		return key in variables ? String(variables[key]) : match;
	});
}

/**
 * Simple pluralization helper
 *
 * @example
 * ```ts
 * const result = pluralize(count, {
 *   zero: "No messages",
 *   one: "1 message",
 *   other: "{count} messages",
 * });
 * ```
 */
export function pluralize(
	count: number,
	forms: { zero?: string; one?: string; other: string },
): string {
	let template: string;

	if (count === 0 && forms.zero) {
		template = forms.zero;
	} else if (count === 1 && forms.one) {
		template = forms.one;
	} else {
		template = forms.other;
	}

	return interpolate(template, { count });
}

/**
 * Create a namespaced translation function
 *
 * @example
 * ```ts
 * const translations = {
 *   "auth.login": "Log In",
 *   "auth.logout": "Log Out",
 *   "nav.home": "Home",
 *   "nav.about": "About",
 * };
 *
 * const authT = createNamespacedT(translations, "auth");
 * authT("login"); // "Log In"
 * authT("logout"); // "Log Out"
 * ```
 */
export function createNamespacedT(
	translations: TranslationDictionary,
	namespace: string,
): (key: string) => string {
	return (key: string) => {
		const fullKey = `${namespace}.${key}`;
		return translations[fullKey] ?? key;
	};
}

/**
 * Merge translation dictionaries (later ones override earlier)
 */
export function mergeTranslations(...dictionaries: TranslationDictionary[]): TranslationDictionary {
	return Object.assign({}, ...dictionaries);
}

/**
 * Extract translation keys from a dictionary
 */
export function extractKeys(dictionary: TranslationDictionary): string[] {
	return Object.keys(dictionary);
}

/**
 * Find missing translations between two dictionaries
 *
 * @example
 * ```ts
 * const missing = findMissingTranslations(
 *   { welcome: "Welcome", goodbye: "Goodbye" },
 *   { welcome: "Bienvenido" }
 * );
 * // ["goodbye"]
 * ```
 */
export function findMissingTranslations(
	reference: TranslationDictionary,
	target: TranslationDictionary,
): string[] {
	return Object.keys(reference).filter((key) => !(key in target));
}
