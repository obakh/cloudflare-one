/**
 * React i18n Integration
 *
 * Client-side internationalization using react-i18next.
 *
 * @see https://react.i18next.com/
 */

import i18n, { type i18n as I18nInstance, type InitOptions, type Resource } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import type { ReactNode } from "react";
import {
	I18nextProvider,
	Trans as I18nextTrans,
	initReactI18next,
	type UseTranslationOptions,
	useTranslation as useI18nextTranslation,
} from "react-i18next";

// Re-export useful types
export type { TFunction } from "i18next";
export type { UseTranslationResponse } from "react-i18next";

/**
 * i18n configuration options
 */
export interface I18nConfig {
	/** Translation resources by locale */
	resources: Resource;
	/** Default/fallback language */
	defaultLocale: string;
	/** Supported locales */
	supportedLocales: string[];
	/** Enable browser language detection */
	detectBrowserLanguage?: boolean;
	/** Namespace for translations (default: "translation") */
	defaultNamespace?: string;
	/** Additional namespaces */
	namespaces?: string[];
	/** Debug mode */
	debug?: boolean;
	/** Custom i18next options */
	i18nextOptions?: Partial<InitOptions>;
}

/**
 * Initialize i18n for React
 *
 * @example
 * ```tsx
 * // i18n.ts
 * import { initI18n } from "@repo/i18n/react";
 *
 * export const i18n = initI18n({
 *   resources: {
 *     en: {
 *       translation: {
 *         welcome: "Welcome!",
 *         "nav.home": "Home",
 *       },
 *     },
 *     es: {
 *       translation: {
 *         welcome: "¡Bienvenido!",
 *         "nav.home": "Inicio",
 *       },
 *     },
 *   },
 *   defaultLocale: "en",
 *   supportedLocales: ["en", "es", "fr"],
 *   detectBrowserLanguage: true,
 * });
 * ```
 */
export function initI18n(config: I18nConfig): I18nInstance {
	const {
		resources,
		defaultLocale,
		supportedLocales,
		detectBrowserLanguage = true,
		defaultNamespace = "translation",
		namespaces = [],
		debug = false,
		i18nextOptions = {},
	} = config;

	const instance = i18n.createInstance();

	// Add language detector if enabled
	if (detectBrowserLanguage) {
		instance.use(LanguageDetector);
	}

	instance.use(initReactI18next).init({
		resources,
		lng: detectBrowserLanguage ? undefined : defaultLocale,
		fallbackLng: defaultLocale,
		supportedLngs: supportedLocales,
		defaultNS: defaultNamespace,
		ns: [defaultNamespace, ...namespaces],
		debug,
		interpolation: {
			escapeValue: false, // React already escapes
		},
		detection: detectBrowserLanguage
			? {
					order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
					lookupQuerystring: "lang",
					lookupCookie: "locale",
					lookupLocalStorage: "locale",
					caches: ["localStorage", "cookie"],
				}
			: undefined,
		...i18nextOptions,
	});

	return instance;
}

/**
 * I18nProvider component
 *
 * @example
 * ```tsx
 * import { I18nProvider } from "@repo/i18n/react";
 * import { i18n } from "./i18n";
 *
 * function App() {
 *   return (
 *     <I18nProvider i18n={i18n}>
 *       <MyApp />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export function I18nProvider({
	i18n: i18nInstance,
	children,
}: {
	i18n: I18nInstance;
	children: ReactNode;
}) {
	return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}

/**
 * useTranslation hook
 *
 * @example
 * ```tsx
 * import { useTranslation } from "@repo/i18n/react";
 *
 * function MyComponent() {
 *   const { t, i18n } = useTranslation();
 *
 *   return (
 *     <div>
 *       <h1>{t("welcome")}</h1>
 *       <p>{t("greeting", { name: "World" })}</p>
 *       <button onClick={() => i18n.changeLanguage("es")}>
 *         Español
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation(ns?: string, options?: UseTranslationOptions<string>) {
	return useI18nextTranslation(ns, options);
}

/**
 * useLocale hook - get current locale and change function
 *
 * @example
 * ```tsx
 * import { useLocale } from "@repo/i18n/react";
 *
 * function LanguageSwitcher() {
 *   const { locale, setLocale, supportedLocales } = useLocale();
 *
 *   return (
 *     <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *       {supportedLocales.map((l) => (
 *         <option key={l} value={l}>{l}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useLocale() {
	const { i18n: i18nInstance } = useI18nextTranslation();

	return {
		/** Current locale */
		locale: i18nInstance.language,
		/** Change locale */
		setLocale: (locale: string) => i18nInstance.changeLanguage(locale),
		/** List of supported locales */
		supportedLocales: (i18nInstance.options.supportedLngs as string[]) || [],
		/** Check if locale is supported */
		isSupported: (locale: string) =>
			((i18nInstance.options.supportedLngs as string[]) || []).includes(locale),
		/** i18n instance */
		i18n: i18nInstance,
	};
}

/**
 * Trans component for complex translations with React elements
 *
 * @example
 * ```tsx
 * import { Trans } from "@repo/i18n/react";
 *
 * // Translation: "Read our <link>terms of service</link>"
 * <Trans
 *   i18nKey="terms"
 *   components={{
 *     link: <a href="/terms" />,
 *   }}
 * />
 *
 * // Translation: "Hello <bold>{{name}}</bold>!"
 * <Trans
 *   i18nKey="greeting"
 *   values={{ name: "World" }}
 *   components={{
 *     bold: <strong />,
 *   }}
 * />
 * ```
 */
export const Trans = I18nextTrans;

/**
 * Format a date according to locale
 *
 * @example
 * ```tsx
 * const { formatDate } = useFormatters();
 * formatDate(new Date()); // "January 13, 2026" (en) or "13 de enero de 2026" (es)
 * ```
 */
export function useFormatters() {
	const { i18n: i18nInstance } = useI18nextTranslation();
	const locale = i18nInstance.language;

	return {
		/**
		 * Format a date
		 */
		formatDate: (date: Date | number, options?: Intl.DateTimeFormatOptions): string => {
			return new Intl.DateTimeFormat(locale, options).format(date);
		},

		/**
		 * Format a number
		 */
		formatNumber: (value: number, options?: Intl.NumberFormatOptions): string => {
			return new Intl.NumberFormat(locale, options).format(value);
		},

		/**
		 * Format currency
		 */
		formatCurrency: (
			value: number,
			currency: string,
			options?: Intl.NumberFormatOptions,
		): string => {
			return new Intl.NumberFormat(locale, {
				style: "currency",
				currency,
				...options,
			}).format(value);
		},

		/**
		 * Format relative time (e.g., "2 days ago")
		 */
		formatRelativeTime: (
			value: number,
			unit: Intl.RelativeTimeFormatUnit,
			options?: Intl.RelativeTimeFormatOptions,
		): string => {
			return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
		},

		/**
		 * Format a list (e.g., "A, B, and C")
		 */
		formatList: (items: string[], options?: Intl.ListFormatOptions): string => {
			return new Intl.ListFormat(locale, options).format(items);
		},
	};
}

/**
 * Language display names
 */
export const LANGUAGE_NAMES: Record<string, Record<string, string>> = {
	en: {
		en: "English",
		es: "Spanish",
		fr: "French",
		de: "German",
		it: "Italian",
		pt: "Portuguese",
		zh: "Chinese",
		ja: "Japanese",
		ko: "Korean",
		ar: "Arabic",
		ru: "Russian",
	},
	es: {
		en: "Inglés",
		es: "Español",
		fr: "Francés",
		de: "Alemán",
		it: "Italiano",
		pt: "Portugués",
		zh: "Chino",
		ja: "Japonés",
		ko: "Coreano",
		ar: "Árabe",
		ru: "Ruso",
	},
	fr: {
		en: "Anglais",
		es: "Espagnol",
		fr: "Français",
		de: "Allemand",
		it: "Italien",
		pt: "Portugais",
		zh: "Chinois",
		ja: "Japonais",
		ko: "Coréen",
		ar: "Arabe",
		ru: "Russe",
	},
};

/**
 * Get language name in a specific locale
 */
export function getLanguageName(languageCode: string, displayLocale: string = "en"): string {
	return (
		LANGUAGE_NAMES[displayLocale]?.[languageCode] || LANGUAGE_NAMES.en[languageCode] || languageCode
	);
}
