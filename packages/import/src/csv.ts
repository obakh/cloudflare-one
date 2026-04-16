/**
 * CSV Parsing Utilities
 *
 * Parse and generate CSV data with support for various formats.
 */

export interface CSVParseOptions {
	/** Delimiter character (default: auto-detect or ",") */
	delimiter?: string;
	/** Quote character (default: '"') */
	quote?: string;
	/** Whether first row is header (default: true) */
	hasHeader?: boolean;
	/** Skip empty rows (default: true) */
	skipEmpty?: boolean;
	/** Trim whitespace from values (default: true) */
	trim?: boolean;
	/** Custom column names (overrides header row) */
	columns?: string[];
}

export interface CSVGenerateOptions {
	/** Delimiter character (default: ",") */
	delimiter?: string;
	/** Quote character (default: '"') */
	quote?: string;
	/** Include header row (default: true) */
	includeHeader?: boolean;
	/** Column order (default: object keys) */
	columns?: string[];
	/** Custom header names */
	headers?: Record<string, string>;
}

/**
 * Parse CSV string into array of objects
 *
 * @example
 * ```ts
 * const data = parseCSV(`name,email,age
 * John,john@example.com,30
 * Jane,jane@example.com,25`);
 *
 * // [{ name: "John", email: "john@example.com", age: "30" }, ...]
 * ```
 */
export function parseCSV<T extends Record<string, string> = Record<string, string>>(
	csv: string,
	options: CSVParseOptions = {},
): T[] {
	const {
		delimiter = detectDelimiter(csv),
		quote = '"',
		hasHeader = true,
		skipEmpty = true,
		trim = true,
		columns,
	} = options;

	const rows = parseRows(csv, delimiter, quote);

	if (rows.length === 0) return [];

	// Get column names
	let headers: string[];
	let dataRows: string[][];

	if (columns) {
		headers = columns;
		dataRows = hasHeader ? rows.slice(1) : rows;
	} else if (hasHeader) {
		headers = rows[0].map((h) => (trim ? h.trim() : h));
		dataRows = rows.slice(1);
	} else {
		headers = rows[0].map((_, i) => `column${i + 1}`);
		dataRows = rows;
	}

	// Convert to objects
	return dataRows
		.filter((row) => !skipEmpty || row.some((cell) => cell.trim() !== ""))
		.map((row) => {
			const obj: Record<string, string> = {};
			headers.forEach((header, i) => {
				const value = row[i] ?? "";
				obj[header] = trim ? value.trim() : value;
			});
			return obj as T;
		});
}

/**
 * Parse CSV into array of arrays (raw rows)
 */
export function parseCSVRaw(
	csv: string,
	options: Pick<CSVParseOptions, "delimiter" | "quote"> = {},
): string[][] {
	const { delimiter = detectDelimiter(csv), quote = '"' } = options;
	return parseRows(csv, delimiter, quote);
}

/**
 * Generate CSV string from array of objects
 *
 * @example
 * ```ts
 * const csv = generateCSV([
 *   { name: "John", email: "john@example.com" },
 *   { name: "Jane", email: "jane@example.com" },
 * ]);
 *
 * // "name,email\nJohn,john@example.com\nJane,jane@example.com"
 * ```
 */
export function generateCSV(
	data: Record<string, unknown>[],
	options: CSVGenerateOptions = {},
): string {
	const { delimiter = ",", quote = '"', includeHeader = true, columns, headers } = options;

	if (data.length === 0) return "";

	// Determine columns
	const cols = columns || Object.keys(data[0]);

	const rows: string[] = [];

	// Header row
	if (includeHeader) {
		const headerRow = cols.map((col) => {
			const name = headers?.[col] ?? col;
			return escapeCSVValue(name, delimiter, quote);
		});
		rows.push(headerRow.join(delimiter));
	}

	// Data rows
	for (const item of data) {
		const row = cols.map((col) => {
			const value = item[col];
			const str = value === null || value === undefined ? "" : String(value);
			return escapeCSVValue(str, delimiter, quote);
		});
		rows.push(row.join(delimiter));
	}

	return rows.join("\n");
}

/**
 * Detect delimiter from CSV content
 */
export function detectDelimiter(csv: string): string {
	const firstLine = csv.split("\n")[0] || "";

	const delimiters = [",", ";", "\t", "|"];
	let maxCount = 0;
	let detected = ",";

	for (const d of delimiters) {
		const count = (firstLine.match(new RegExp(`\\${d}`, "g")) || []).length;
		if (count > maxCount) {
			maxCount = count;
			detected = d;
		}
	}

	return detected;
}

/**
 * Parse rows handling quoted values
 */
function parseRows(csv: string, delimiter: string, quote: string): string[][] {
	const rows: string[][] = [];
	let currentRow: string[] = [];
	let currentValue = "";
	let inQuotes = false;

	for (let i = 0; i < csv.length; i++) {
		const char = csv[i];
		const nextChar = csv[i + 1];

		if (inQuotes) {
			if (char === quote) {
				if (nextChar === quote) {
					// Escaped quote
					currentValue += quote;
					i++;
				} else {
					// End of quoted value
					inQuotes = false;
				}
			} else {
				currentValue += char;
			}
		} else {
			if (char === quote) {
				inQuotes = true;
			} else if (char === delimiter) {
				currentRow.push(currentValue);
				currentValue = "";
			} else if (char === "\r") {
			} else if (char === "\n") {
				currentRow.push(currentValue);
				rows.push(currentRow);
				currentRow = [];
				currentValue = "";
			} else {
				currentValue += char;
			}
		}
	}

	// Handle last value/row
	if (currentValue || currentRow.length > 0) {
		currentRow.push(currentValue);
		rows.push(currentRow);
	}

	return rows;
}

/**
 * Escape value for CSV
 */
function escapeCSVValue(value: string, delimiter: string, quote: string): string {
	const needsQuoting =
		value.includes(delimiter) ||
		value.includes(quote) ||
		value.includes("\n") ||
		value.includes("\r");

	if (needsQuoting) {
		const escaped = value.replace(new RegExp(quote, "g"), quote + quote);
		return `${quote}${escaped}${quote}`;
	}

	return value;
}

/**
 * Validate CSV structure
 */
export function validateCSV(
	csv: string,
	options: {
		requiredColumns?: string[];
		minRows?: number;
		maxRows?: number;
	} = {},
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	try {
		const data = parseCSV(csv);

		if (data.length === 0) {
			errors.push("CSV is empty");
			return { valid: false, errors };
		}

		if (options.minRows && data.length < options.minRows) {
			errors.push(`CSV must have at least ${options.minRows} rows`);
		}

		if (options.maxRows && data.length > options.maxRows) {
			errors.push(`CSV must have at most ${options.maxRows} rows`);
		}

		if (options.requiredColumns) {
			const columns = Object.keys(data[0]);
			for (const required of options.requiredColumns) {
				if (!columns.includes(required)) {
					errors.push(`Missing required column: ${required}`);
				}
			}
		}
	} catch (e) {
		errors.push(`Invalid CSV format: ${e instanceof Error ? e.message : "Unknown error"}`);
	}

	return { valid: errors.length === 0, errors };
}
