/**
 * Data Transformation Utilities
 *
 * Parse, format, and transform imported data.
 * Uses @repo/location for currency parsing.
 */

import { parseCurrencyAmount } from "@repo/location/currencies";

// ============================================================================
// Date Parsing
// ============================================================================

/**
 * Common date format patterns
 */
const DATE_PATTERNS: Array<{
	regex: RegExp;
	parse: (match: RegExpMatchArray) => Date | null;
}> = [
	// ISO: 2025-01-13, 2025-01-13T10:30:00
	{
		regex: /^(\d{4})-(\d{2})-(\d{2})(?:T|\s)?/,
		parse: (m) => createDate(+m[1], +m[2], +m[3]),
	},
	// US: 01/13/2025, 1/13/2025
	{
		regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
		parse: (m) => createDate(+m[3], +m[1], +m[2]),
	},
	// EU: 13/01/2025, 13.01.2025
	{
		regex: /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/,
		parse: (m) => createDate(+m[3], +m[2], +m[1]),
	},
	// Short year: 01/13/25
	{
		regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
		parse: (m) => {
			const year = +m[3] + (+m[3] > 50 ? 1900 : 2000);
			return createDate(year, +m[1], +m[2]);
		},
	},
	// Written: Jan 13, 2025 / January 13, 2025
	{
		regex: /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
		parse: (m) => {
			const month = parseMonth(m[1]);
			return month !== null ? createDate(+m[3], month, +m[2]) : null;
		},
	},
	// Written: 13 Jan 2025 / 13 January 2025
	{
		regex: /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
		parse: (m) => {
			const month = parseMonth(m[2]);
			return month !== null ? createDate(+m[3], month, +m[1]) : null;
		},
	},
];

const MONTHS: Record<string, number> = {
	jan: 1,
	january: 1,
	feb: 2,
	february: 2,
	mar: 3,
	march: 3,
	apr: 4,
	april: 4,
	may: 5,
	jun: 6,
	june: 6,
	jul: 7,
	july: 7,
	aug: 8,
	august: 8,
	sep: 9,
	sept: 9,
	september: 9,
	oct: 10,
	october: 10,
	nov: 11,
	november: 11,
	dec: 12,
	december: 12,
};

function parseMonth(str: string): number | null {
	return MONTHS[str.toLowerCase()] ?? null;
}

function createDate(year: number, month: number, day: number): Date | null {
	if (month < 1 || month > 12 || day < 1 || day > 31) return null;
	const date = new Date(year, month - 1, day);
	// Validate the date is correct (handles invalid dates like Feb 30)
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return null;
	}
	return date;
}

/**
 * Parse date string into Date object
 *
 * @example
 * ```ts
 * parseDate("2025-01-13");     // Date
 * parseDate("01/13/2025");     // Date (US format)
 * parseDate("13/01/2025");     // Date (EU format)
 * parseDate("Jan 13, 2025");   // Date
 * parseDate("invalid");        // null
 * ```
 */
export function parseDate(dateString: string): Date | null {
	if (!dateString?.trim()) return null;

	const trimmed = dateString.trim();

	for (const pattern of DATE_PATTERNS) {
		const match = trimmed.match(pattern.regex);
		if (match) {
			const date = pattern.parse(match);
			if (date) return date;
		}
	}

	// Fallback: try native Date parsing
	const native = new Date(trimmed);
	return Number.isNaN(native.getTime()) ? null : native;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string | null): string | null {
	if (!date) return null;

	const d = typeof date === "string" ? parseDate(date) : date;
	if (!d) return null;

	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

// ============================================================================
// Amount Parsing
// ============================================================================

/**
 * Parse amount string to number
 * Handles various formats: "1,234.56", "1.234,56", "$1,234.56", "(100.00)"
 *
 * @example
 * ```ts
 * parseAmount("1,234.56");     // 1234.56
 * parseAmount("1.234,56");     // 1234.56 (EU format)
 * parseAmount("$1,234.56");    // 1234.56
 * parseAmount("(100.00)");     // -100 (accounting negative)
 * parseAmount("-$50.00");      // -50
 * ```
 */
export function parseAmount(value: string, options: { inverted?: boolean } = {}): number {
	if (!value?.trim()) return 0;

	let str = value.trim();

	// Handle accounting negative format: (100.00)
	const isAccountingNegative = str.startsWith("(") && str.endsWith(")");
	if (isAccountingNegative) {
		str = str.slice(1, -1);
	}

	// Use location package for parsing
	let amount = parseCurrencyAmount(str);

	// Apply accounting negative
	if (isAccountingNegative && amount > 0) {
		amount = -amount;
	}

	// Invert if requested
	if (options.inverted) {
		amount = -amount;
	}

	return amount;
}

/**
 * Format amount with optional currency
 */
export function formatAmount(
	amount: number,
	options: {
		decimals?: number;
		thousandsSeparator?: string;
		decimalSeparator?: string;
	} = {},
): string {
	const { decimals = 2, thousandsSeparator = ",", decimalSeparator = "." } = options;

	const fixed = Math.abs(amount).toFixed(decimals);
	const [intPart, decPart] = fixed.split(".");

	const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

	const sign = amount < 0 ? "-" : "";
	return decPart
		? `${sign}${withThousands}${decimalSeparator}${decPart}`
		: `${sign}${withThousands}`;
}

// ============================================================================
// String Transformations
// ============================================================================

/**
 * Normalize string (trim, collapse whitespace)
 */
export function normalizeString(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

/**
 * Convert to title case
 */
export function toTitleCase(value: string): string {
	return value.toLowerCase().replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

/**
 * Convert to sentence case
 */
export function toSentenceCase(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * Slugify string
 */
export function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

// ============================================================================
// Data Mapping
// ============================================================================

export interface FieldMapping<T> {
	/** Source field name(s) - first match wins */
	source: string | string[];
	/** Target field name */
	target: keyof T;
	/** Transform function */
	transform?: (value: string, row: Record<string, string>) => unknown;
	/** Default value if source is empty */
	default?: unknown;
	/** Whether field is required */
	required?: boolean;
}

/**
 * Map source data to target schema
 *
 * @example
 * ```ts
 * interface User {
 *   name: string;
 *   email: string;
 *   createdAt: Date | null;
 * }
 *
 * const mappings: FieldMapping<User>[] = [
 *   { source: ["Name", "Full Name", "name"], target: "name" },
 *   { source: "Email", target: "email", transform: (v) => v.toLowerCase() },
 *   { source: "Created", target: "createdAt", transform: parseDate },
 * ];
 *
 * const users = mapData<User>(csvData, mappings);
 * ```
 */
export function mapData<T extends Record<string, unknown>>(
	data: Record<string, string>[],
	mappings: FieldMapping<T>[],
): { data: T[]; errors: Array<{ row: number; field: string; message: string }> } {
	const errors: Array<{ row: number; field: string; message: string }> = [];
	const result: T[] = [];

	for (let i = 0; i < data.length; i++) {
		const row = data[i];
		const mapped: Record<string, unknown> = {};

		for (const mapping of mappings) {
			const sources = Array.isArray(mapping.source) ? mapping.source : [mapping.source];

			// Find first matching source field
			let value: string | undefined;
			for (const source of sources) {
				if (source in row && row[source]?.trim()) {
					value = row[source];
					break;
				}
			}

			// Apply transform or use raw value
			let finalValue: unknown;
			if (value !== undefined) {
				finalValue = mapping.transform ? mapping.transform(value, row) : value;
			} else if (mapping.default !== undefined) {
				finalValue = mapping.default;
			} else {
				finalValue = undefined;
			}

			// Check required
			if (mapping.required && (finalValue === undefined || finalValue === "")) {
				errors.push({
					row: i + 1,
					field: String(mapping.target),
					message: `Required field "${String(mapping.target)}" is missing`,
				});
			}

			mapped[mapping.target as string] = finalValue;
		}

		result.push(mapped as T);
	}

	return { data: result, errors };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
	const cleaned = phone.replace(/[\s\-().]/g, "");
	return /^\+?\d{7,15}$/.test(cleaned);
}

/**
 * Clean phone number
 */
export function cleanPhone(phone: string): string {
	return phone.replace(/[\s\-().]/g, "");
}
