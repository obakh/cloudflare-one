/**
 * Invoice Defaults
 *
 * Default values for invoice templates - single source of truth
 */

import type { InvoiceTemplate } from "./types.js";

/**
 * Default label values for invoice templates
 */
export const DEFAULT_TEMPLATE_LABELS = {
	title: "Invoice",
	fromLabel: "From",
	customerLabel: "To",
	invoiceNoLabel: "Invoice No",
	issueDateLabel: "Issue Date",
	dueDateLabel: "Due Date",
	descriptionLabel: "Description",
	quantityLabel: "Quantity",
	priceLabel: "Price",
	totalLabel: "Total",
	subtotalLabel: "Subtotal",
	totalSummaryLabel: "Total",
	vatLabel: "VAT",
	taxLabel: "Tax",
	discountLabel: "Discount",
	paymentLabel: "Payment Details",
	noteLabel: "Note",
	lineItemTaxLabel: "Tax",
} as const;

/**
 * Default settings for invoice templates
 */
export const DEFAULT_TEMPLATE_SETTINGS = {
	currency: "USD",
	locale: "en-US",
	timezone: "UTC",
	dateFormat: "MM/dd/yyyy",
	size: "letter" as const,

	// Tax/VAT - disabled by default
	includeVat: false,
	includeTax: false,
	includeDiscount: false,
	includeLineItemTax: false,
	vatRate: 0,
	taxRate: 0,

	// Display
	includeDecimals: true,
	includeUnits: false,
	includeQr: true,

	// Branding
	logoUrl: null,

	// Default content
	fromDetails: null,
	paymentDetails: null,
	noteDetails: null,

	// Delivery
	deliveryType: "create" as const,
} as const;

/**
 * Complete default template
 */
export const DEFAULT_TEMPLATE: InvoiceTemplate = {
	...DEFAULT_TEMPLATE_LABELS,
	...DEFAULT_TEMPLATE_SETTINGS,
};

/**
 * Create a template with custom overrides
 */
export function createTemplate(overrides: Partial<InvoiceTemplate> = {}): InvoiceTemplate {
	return {
		...DEFAULT_TEMPLATE,
		...overrides,
	};
}
