/**
 * @repo/invoice
 *
 * Invoice generation, calculations, and PDF rendering.
 *
 * @example Basic usage
 * ```ts
 * import {
 *   calculateTotal,
 *   formatCurrency,
 *   generateInvoiceToken,
 *   DEFAULT_TEMPLATE,
 * } from "@repo/invoice";
 *
 * // Calculate totals
 * const totals = calculateTotal({
 *   lineItems: [
 *     { name: "Consulting", price: 150, quantity: 10 },
 *     { name: "Development", price: 200, quantity: 20 },
 *   ],
 *   taxRate: 10,
 *   includeTax: true,
 * });
 *
 * // Format currency
 * const formatted = formatCurrency(totals.total, "USD", "en-US");
 *
 * // Generate secure token
 * const token = await generateInvoiceToken({ id: "inv_123" }, secretKey);
 * ```
 *
 * @example PDF generation
 * ```ts
 * import { PdfTemplate, renderToBuffer } from "@repo/invoice/templates/pdf";
 *
 * const pdf = await renderToBuffer(<PdfTemplate data={invoice} />);
 * ```
 *
 * @example Recurring invoices
 * ```ts
 * import {
 *   getNextDate,
 *   calculatePreviewDates,
 *   getFrequencyLabel,
 * } from "@repo/invoice/recurring";
 *
 * const config = {
 *   frequency: "monthly_date",
 *   frequencyDay: 15,
 *   endType: "after_count",
 *   endCount: 12,
 * };
 *
 * const upcoming = calculatePreviewDates(config, new Date(), 1000, 3);
 * ```
 */

export type { CalculateTotalOptions, CalculateTotalResult } from "./calculate.js";
// Calculations
export {
	calculateLineItemTotal,
	calculateLineItemTotalWithTax,
	calculateTotal,
	formatCurrency,
	formatPercentage,
} from "./calculate.js";
// Currency
export {
	COMMON_CURRENCIES,
	fromSmallestUnit,
	fromStripeAmount,
	getCurrencyDecimals,
	getCurrencyMultiplier,
	getCurrencySymbol,
	isThreeDecimalCurrency,
	isZeroDecimalCurrency,
	THREE_DECIMAL_CURRENCIES,
	toSmallestUnit,
	toStripeAmount,
	ZERO_DECIMAL_CURRENCIES,
} from "./currency.js";
// Defaults
export {
	createTemplate,
	DEFAULT_TEMPLATE,
	DEFAULT_TEMPLATE_LABELS,
	DEFAULT_TEMPLATE_SETTINGS,
} from "./defaults.js";
export type {
	RecurringConfig,
	RecurringEndType,
	RecurringFrequency,
	RecurringStatus,
	UpcomingInvoice,
	ValidationError,
} from "./recurring.js";
// Recurring (re-export commonly used)
export {
	calculatePreviewDates,
	calculateSummary,
	formatNextScheduled,
	formatOrdinal,
	formatRecurringProgress,
	getFrequencyLabel,
	getFrequencyShortLabel,
	getNextDate,
	isValidRecurringConfig,
	RECURRING_END_TYPES,
	RECURRING_FREQUENCIES,
	RECURRING_STATUSES,
	validateRecurringConfig,
} from "./recurring.js";
export type { InvoiceTokenPayload } from "./token.js";
// Token
export {
	generateInvoiceActionToken,
	generateInvoiceToken,
	verifyInvoiceActionToken,
	verifyInvoiceToken,
} from "./token.js";
// Types
export type {
	CustomerData,
	EditorDoc,
	EditorNode,
	InlineContent,
	Invoice,
	InvoiceProduct,
	InvoiceStatus,
	InvoiceTemplate,
	LineItem,
	Mark,
} from "./types.js";
// Utilities
export {
	calculateDueDate,
	extractTextFromContent,
	formatInvoiceDate,
	generateInvoiceNumber,
	getDaysUntilDue,
	isEditorContentEmpty,
	isInvoiceOverdue,
	isValidJSON,
	isValidLogoUrl,
	isValidLogoUrlFormat,
	parseInvoiceNumber,
	transformCustomerToContent,
} from "./utils.js";
