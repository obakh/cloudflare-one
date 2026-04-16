/**
 * Currency Utilities
 *
 * Handle currency-specific formatting for payment processors (Stripe, etc.)
 * Stripe requires amounts in the smallest currency unit, which varies by currency.
 *
 * @see https://docs.stripe.com/currencies
 */

// ============================================================================
// Currency Classifications
// ============================================================================

/**
 * Zero-decimal currencies where 1 unit = 1 smallest unit.
 * For these currencies, amounts should NOT be multiplied.
 * Example: ¥1000 JPY should be passed as 1000, not 100000.
 */
export const ZERO_DECIMAL_CURRENCIES = new Set([
	"bif", // Burundian Franc
	"clp", // Chilean Peso
	"djf", // Djiboutian Franc
	"gnf", // Guinean Franc
	"jpy", // Japanese Yen
	"kmf", // Comorian Franc
	"krw", // South Korean Won
	"mga", // Malagasy Ariary
	"pyg", // Paraguayan Guaraní
	"rwf", // Rwandan Franc
	"ugx", // Ugandan Shilling
	"vnd", // Vietnamese Dong
	"vuv", // Vanuatu Vatu
	"xaf", // Central African CFA Franc
	"xof", // West African CFA Franc
	"xpf", // CFP Franc
]);

/**
 * Three-decimal currencies where amounts should be multiplied by 1000.
 * These currencies have 3 decimal places instead of the usual 2.
 */
export const THREE_DECIMAL_CURRENCIES = new Set([
	"bhd", // Bahraini Dinar
	"jod", // Jordanian Dinar
	"kwd", // Kuwaiti Dinar
	"omr", // Omani Rial
	"tnd", // Tunisian Dinar
]);

// ============================================================================
// Currency Checks
// ============================================================================

/**
 * Check if a currency is a zero-decimal currency
 */
export function isZeroDecimalCurrency(currency: string): boolean {
	return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase());
}

/**
 * Check if a currency is a three-decimal currency
 */
export function isThreeDecimalCurrency(currency: string): boolean {
	return THREE_DECIMAL_CURRENCIES.has(currency.toLowerCase());
}

/**
 * Get the decimal multiplier for a currency
 * - Zero-decimal: 1
 * - Three-decimal: 1000
 * - Standard: 100
 */
export function getCurrencyMultiplier(currency: string): number {
	const normalized = currency.toLowerCase();

	if (ZERO_DECIMAL_CURRENCIES.has(normalized)) {
		return 1;
	}

	if (THREE_DECIMAL_CURRENCIES.has(normalized)) {
		return 1000;
	}

	return 100;
}

/**
 * Get the number of decimal places for a currency
 */
export function getCurrencyDecimals(currency: string): number {
	const normalized = currency.toLowerCase();

	if (ZERO_DECIMAL_CURRENCIES.has(normalized)) {
		return 0;
	}

	if (THREE_DECIMAL_CURRENCIES.has(normalized)) {
		return 3;
	}

	return 2;
}

// ============================================================================
// Amount Conversion
// ============================================================================

/**
 * Convert an amount to smallest currency unit (for Stripe, etc.)
 *
 * @example
 * ```ts
 * toSmallestUnit(10.00, "USD")  // 1000 (cents)
 * toSmallestUnit(1000, "JPY")   // 1000 (yen, no conversion)
 * toSmallestUnit(10.00, "KWD")  // 10000 (fils)
 * ```
 */
export function toSmallestUnit(amount: number, currency: string): number {
	const multiplier = getCurrencyMultiplier(currency);
	return Math.round(amount * multiplier);
}

/**
 * Convert from smallest currency unit back to standard unit
 *
 * @example
 * ```ts
 * fromSmallestUnit(1000, "USD")  // 10.00 (dollars)
 * fromSmallestUnit(1000, "JPY")  // 1000 (yen)
 * fromSmallestUnit(10000, "KWD") // 10.00 (dinars)
 * ```
 */
export function fromSmallestUnit(amount: number, currency: string): number {
	const multiplier = getCurrencyMultiplier(currency);
	return amount / multiplier;
}

// ============================================================================
// Stripe-specific aliases
// ============================================================================

/** Alias for toSmallestUnit - converts to Stripe amount format */
export const toStripeAmount = toSmallestUnit;

/** Alias for fromSmallestUnit - converts from Stripe amount format */
export const fromStripeAmount = fromSmallestUnit;

// ============================================================================
// Currency Symbol
// ============================================================================

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string, locale: string = "en-US"): string {
	try {
		const formatter = new Intl.NumberFormat(locale, {
			style: "currency",
			currency: currency.toUpperCase(),
			currencyDisplay: "narrowSymbol",
		});

		const parts = formatter.formatToParts(0);
		const symbolPart = parts.find((part) => part.type === "currency");
		return symbolPart?.value ?? currency.toUpperCase();
	} catch {
		return currency.toUpperCase();
	}
}

/**
 * Common currency codes with their symbols
 */
export const COMMON_CURRENCIES = {
	USD: { code: "USD", symbol: "$", name: "US Dollar" },
	EUR: { code: "EUR", symbol: "€", name: "Euro" },
	GBP: { code: "GBP", symbol: "£", name: "British Pound" },
	JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
	CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
	AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
	CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
	CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
	INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
	MXN: { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
	BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real" },
	KRW: { code: "KRW", symbol: "₩", name: "South Korean Won" },
	SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona" },
	NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
	DKK: { code: "DKK", symbol: "kr", name: "Danish Krone" },
	SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
	HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
	NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
} as const;
