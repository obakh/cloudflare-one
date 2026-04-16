/**
 * @repo/location
 *
 * Geo-location utilities: countries, currencies, timezones, and locale-aware formatting.
 * Integrates with @repo/i18n for locale detection.
 *
 * @example Get location data from request
 * ```ts
 * import { getLocationFromRequest } from "@repo/location";
 *
 * const location = getLocationFromRequest(request);
 * console.log(location.country);   // "US"
 * console.log(location.currency);  // { code: "USD", symbol: "$", ... }
 * console.log(location.timezone);  // { id: "America/New_York", ... }
 * console.log(location.dateFormat); // "MM/dd/yyyy"
 * ```
 *
 * @example Format currency
 * ```ts
 * import { formatCurrency, getCurrencyForCountry } from "@repo/location/currencies";
 *
 * const currency = getCurrencyForCountry("JP");
 * const formatted = formatCurrency(1234, "JPY", "ja-JP"); // "¥1,234"
 * ```
 */

// Re-export from @repo/i18n for convenience
export { COUNTRY_LOCALE_MAP, detectLocale, getGeoData } from "@repo/i18n";

// Countries
export {
	COUNTRY_FLAGS,
	COUNTRY_NAMES,
	type Country,
	getAllCountries,
	getCountry,
	getCountryFlag,
	searchCountries,
} from "./countries.js";

// Currencies
export {
	COUNTRY_CURRENCY_MAP,
	CURRENCIES,
	type Currency,
	formatCurrency,
	getAllCurrencies,
	getCurrency,
	getCurrencyForCountry,
	parseCurrencyAmount,
} from "./currencies.js";

// Timezones
export {
	COUNTRY_TIMEZONE_MAP,
	convertTimezone,
	getAllTimezones,
	getDateInTimezone,
	getTimeInTimezone,
	getTimezone,
	getTimezoneForCountry,
	getTimezonesByOffset,
	TIMEZONES,
	type Timezone,
} from "./timezones.js";

// ============================================================================
// Integrated Location Detection
// ============================================================================

import { getGeoData } from "@repo/i18n";
import { type Country, getCountry } from "./countries.js";
import { type Currency, getCurrencyForCountry } from "./currencies.js";
import { getTimezoneForCountry, type Timezone } from "./timezones.js";

export interface LocationData {
	/** ISO country code */
	countryCode?: string;
	/** Country details */
	country?: Country;
	/** Currency for country */
	currency?: Currency;
	/** Primary timezone for country */
	timezone?: Timezone;
	/** Cloudflare-detected timezone */
	detectedTimezone?: string;
	/** Recommended date format */
	dateFormat: string;
	/** City (from Cloudflare) */
	city?: string;
	/** Region (from Cloudflare) */
	region?: string;
}

/**
 * Date format patterns by country
 */
const DATE_FORMATS: Record<string, string> = {
	US: "MM/dd/yyyy",
	CA: "yyyy-MM-dd",
	GB: "dd/MM/yyyy",
	AU: "dd/MM/yyyy",
	NZ: "dd/MM/yyyy",
	IN: "dd/MM/yyyy",
	ZA: "yyyy/MM/dd",
	BR: "dd/MM/yyyy",
	AR: "dd/MM/yyyy",
	CN: "yyyy-MM-dd",
	JP: "yyyy/MM/dd",
	KR: "yyyy-MM-dd",
	TW: "yyyy/MM/dd",
	DE: "dd.MM.yyyy",
	AT: "dd.MM.yyyy",
	CH: "dd.MM.yyyy",
	FR: "dd/MM/yyyy",
	IT: "dd/MM/yyyy",
	ES: "dd/MM/yyyy",
	PT: "dd/MM/yyyy",
	NL: "dd-MM-yyyy",
	BE: "dd/MM/yyyy",
	SE: "yyyy-MM-dd",
	NO: "dd.MM.yyyy",
	DK: "dd-MM-yyyy",
	FI: "dd.MM.yyyy",
	PL: "dd.MM.yyyy",
	RU: "dd.MM.yyyy",
	TR: "dd.MM.yyyy",
};

/**
 * Get date format for country
 */
export function getDateFormat(countryCode?: string): string {
	if (!countryCode) return "yyyy-MM-dd";
	return DATE_FORMATS[countryCode.toUpperCase()] || "yyyy-MM-dd";
}

/**
 * Get comprehensive location data from Cloudflare request
 *
 * @example
 * ```ts
 * export default {
 *   async fetch(request: Request) {
 *     const location = getLocationFromRequest(request);
 *
 *     return Response.json({
 *       country: location.country?.name,
 *       currency: location.currency?.code,
 *       timezone: location.timezone?.id,
 *     });
 *   }
 * }
 * ```
 */
export function getLocationFromRequest(request: Request): LocationData {
	const geo = getGeoData(request);
	const countryCode = geo.country;

	return {
		countryCode,
		country: countryCode ? getCountry(countryCode) : undefined,
		currency: countryCode ? getCurrencyForCountry(countryCode) : undefined,
		timezone: countryCode ? getTimezoneForCountry(countryCode) : undefined,
		detectedTimezone: geo.timezone,
		dateFormat: getDateFormat(countryCode),
		city: geo.city,
		region: geo.region,
	};
}

/**
 * Get location data by country code
 */
export function getLocationByCountry(countryCode: string): LocationData {
	return {
		countryCode,
		country: getCountry(countryCode),
		currency: getCurrencyForCountry(countryCode),
		timezone: getTimezoneForCountry(countryCode),
		dateFormat: getDateFormat(countryCode),
	};
}
