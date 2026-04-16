/**
 * @repo/import
 *
 * Data import utilities: CSV parsing, data transformation, and validation.
 * Integrates with @repo/location for currency/amount parsing.
 *
 * @example Parse and transform CSV
 * ```ts
 * import { parseCSV, mapData, parseDate, parseAmount } from "@repo/import";
 *
 * interface Transaction {
 *   date: Date | null;
 *   description: string;
 *   amount: number;
 * }
 *
 * const csv = await file.text();
 * const raw = parseCSV(csv);
 *
 * const { data, errors } = mapData<Transaction>(raw, [
 *   { source: "Date", target: "date", transform: parseDate },
 *   { source: ["Description", "Memo"], target: "description" },
 *   { source: "Amount", target: "amount", transform: parseAmount },
 * ]);
 * ```
 *
 * @example Generate CSV
 * ```ts
 * import { generateCSV } from "@repo/import/csv";
 *
 * const csv = generateCSV(users, {
 *   columns: ["name", "email", "createdAt"],
 *   headers: { createdAt: "Created Date" },
 * });
 * ```
 */

// Re-export currency parsing from location
export { formatCurrency, parseCurrencyAmount } from "@repo/location/currencies";
// CSV
export {
	type CSVGenerateOptions,
	type CSVParseOptions,
	detectDelimiter,
	generateCSV,
	parseCSV,
	parseCSVRaw,
	validateCSV,
} from "./csv.js";
// Transform
export {
	cleanPhone,
	type FieldMapping,
	formatAmount,
	formatDateISO,
	// Validation
	isValidEmail,
	isValidPhone,
	isValidUrl,
	// Mapping
	mapData,
	// String
	normalizeString,
	// Amount
	parseAmount,
	// Date
	parseDate,
	slugify,
	toSentenceCase,
	toTitleCase,
} from "./transform.js";
