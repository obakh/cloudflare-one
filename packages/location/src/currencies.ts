/**
 * Currency Data
 *
 * ISO 4217 currency codes with symbols and country mappings.
 */

export interface Currency {
	code: string;
	name: string;
	symbol: string;
	decimals: number;
}

/**
 * Currency definitions
 */
export const CURRENCIES: Record<string, Currency> = {
	USD: { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 },
	EUR: { code: "EUR", name: "Euro", symbol: "€", decimals: 2 },
	GBP: { code: "GBP", name: "British Pound", symbol: "£", decimals: 2 },
	JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0 },
	CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimals: 2 },
	AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", decimals: 2 },
	CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", decimals: 2 },
	CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimals: 2 },
	HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimals: 2 },
	SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimals: 2 },
	SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr", decimals: 2 },
	KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", decimals: 0 },
	NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr", decimals: 2 },
	NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", decimals: 2 },
	INR: { code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 2 },
	MXN: { code: "MXN", name: "Mexican Peso", symbol: "$", decimals: 2 },
	TWD: { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", decimals: 2 },
	ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", decimals: 2 },
	BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", decimals: 2 },
	DKK: { code: "DKK", name: "Danish Krone", symbol: "kr", decimals: 2 },
	PLN: { code: "PLN", name: "Polish Zloty", symbol: "zł", decimals: 2 },
	THB: { code: "THB", name: "Thai Baht", symbol: "฿", decimals: 2 },
	ILS: { code: "ILS", name: "Israeli Shekel", symbol: "₪", decimals: 2 },
	IDR: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", decimals: 0 },
	CZK: { code: "CZK", name: "Czech Koruna", symbol: "Kč", decimals: 2 },
	AED: { code: "AED", name: "UAE Dirham", symbol: "د.إ", decimals: 2 },
	TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", decimals: 2 },
	HUF: { code: "HUF", name: "Hungarian Forint", symbol: "Ft", decimals: 2 },
	CLP: { code: "CLP", name: "Chilean Peso", symbol: "$", decimals: 0 },
	SAR: { code: "SAR", name: "Saudi Riyal", symbol: "﷼", decimals: 2 },
	PHP: { code: "PHP", name: "Philippine Peso", symbol: "₱", decimals: 2 },
	MYR: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", decimals: 2 },
	COP: { code: "COP", name: "Colombian Peso", symbol: "$", decimals: 2 },
	RUB: { code: "RUB", name: "Russian Ruble", symbol: "₽", decimals: 2 },
	RON: { code: "RON", name: "Romanian Leu", symbol: "lei", decimals: 2 },
	PEN: { code: "PEN", name: "Peruvian Sol", symbol: "S/", decimals: 2 },
	BGN: { code: "BGN", name: "Bulgarian Lev", symbol: "лв", decimals: 2 },
	ARS: { code: "ARS", name: "Argentine Peso", symbol: "$", decimals: 2 },
	UAH: { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", decimals: 2 },
	VND: { code: "VND", name: "Vietnamese Dong", symbol: "₫", decimals: 0 },
	NGN: { code: "NGN", name: "Nigerian Naira", symbol: "₦", decimals: 2 },
	EGP: { code: "EGP", name: "Egyptian Pound", symbol: "£", decimals: 2 },
	PKR: { code: "PKR", name: "Pakistani Rupee", symbol: "₨", decimals: 2 },
	BDT: { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", decimals: 2 },
	KES: { code: "KES", name: "Kenyan Shilling", symbol: "KSh", decimals: 2 },
};

/**
 * Country to currency mapping
 */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
	US: "USD",
	GB: "GBP",
	EU: "EUR",
	JP: "JPY",
	CN: "CNY",
	AU: "AUD",
	CA: "CAD",
	CH: "CHF",
	HK: "HKD",
	SG: "SGD",
	SE: "SEK",
	KR: "KRW",
	NO: "NOK",
	NZ: "NZD",
	IN: "INR",
	MX: "MXN",
	TW: "TWD",
	ZA: "ZAR",
	BR: "BRL",
	DK: "DKK",
	PL: "PLN",
	TH: "THB",
	IL: "ILS",
	ID: "IDR",
	CZ: "CZK",
	AE: "AED",
	TR: "TRY",
	HU: "HUF",
	CL: "CLP",
	SA: "SAR",
	PH: "PHP",
	MY: "MYR",
	CO: "COP",
	RU: "RUB",
	RO: "RON",
	PE: "PEN",
	BG: "BGN",
	AR: "ARS",
	UA: "UAH",
	VN: "VND",
	NG: "NGN",
	EG: "EGP",
	PK: "PKR",
	BD: "BDT",
	KE: "KES",
	// Eurozone
	AT: "EUR",
	BE: "EUR",
	CY: "EUR",
	EE: "EUR",
	FI: "EUR",
	FR: "EUR",
	DE: "EUR",
	GR: "EUR",
	IE: "EUR",
	IT: "EUR",
	LV: "EUR",
	LT: "EUR",
	LU: "EUR",
	MT: "EUR",
	NL: "EUR",
	PT: "EUR",
	SK: "EUR",
	SI: "EUR",
	ES: "EUR",
	HR: "EUR",
};

/**
 * Get currency by code
 */
export function getCurrency(code: string): Currency | undefined {
	return CURRENCIES[code.toUpperCase()];
}

/**
 * Get currency for country
 */
export function getCurrencyForCountry(countryCode: string): Currency | undefined {
	const currencyCode = COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()];
	return currencyCode ? CURRENCIES[currencyCode] : undefined;
}

/**
 * Get all currencies as array
 */
export function getAllCurrencies(): Currency[] {
	return Object.values(CURRENCIES);
}

/**
 * Format amount with currency
 */
export function formatCurrency(amount: number, currencyCode: string, locale = "en-US"): string {
	const currency = getCurrency(currencyCode);
	if (!currency) {
		return amount.toFixed(2);
	}

	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currency.code,
		minimumFractionDigits: currency.decimals,
		maximumFractionDigits: currency.decimals,
	}).format(amount);
}

/**
 * Parse currency amount from string
 * Handles various formats: "1,234.56", "1.234,56", "$1,234.56"
 */
export function parseCurrencyAmount(value: string): number {
	// Remove currency symbols and whitespace
	let cleaned = value.replace(/[^\d.,\-−]/g, "");

	// Handle special minus sign (−)
	cleaned = cleaned.replace(/−/g, "-");

	// Determine decimal separator
	const lastComma = cleaned.lastIndexOf(",");
	const lastDot = cleaned.lastIndexOf(".");

	if (lastComma > lastDot) {
		// European format: 1.234,56
		cleaned = cleaned.replace(/\./g, "").replace(",", ".");
	} else {
		// US format: 1,234.56
		cleaned = cleaned.replace(/,/g, "");
	}

	return parseFloat(cleaned) || 0;
}
