/**
 * Invoice Types
 *
 * Core types for invoice generation and management
 */

// ============================================================================
// Line Items
// ============================================================================

export interface LineItem {
	/** Item description/name */
	name: string;
	/** Quantity (default: 1) */
	quantity?: number;
	/** Unit price */
	price?: number;
	/** Unit of measurement (e.g., "hours", "units") */
	unit?: string;
	/** Per-line-item tax rate (percentage, 0-100) */
	taxRate?: number;
	/** Optional product reference ID */
	productId?: string;
}

// ============================================================================
// Invoice
// ============================================================================

export type InvoiceStatus =
	| "draft"
	| "pending"
	| "sent"
	| "viewed"
	| "paid"
	| "overdue"
	| "canceled"
	| "refunded";

export interface Invoice {
	id: string;
	/** Invoice number (e.g., "INV-001") */
	invoiceNumber: string | null;
	/** Invoice status */
	status: InvoiceStatus;
	/** Issue date (ISO string) */
	issueDate: string | null;
	/** Due date (ISO string) */
	dueDate: string | null;
	/** Currency code (ISO 4217) */
	currency: string | null;
	/** Line items */
	lineItems: LineItem[];
	/** Calculated total amount */
	amount: number | null;
	/** VAT amount */
	vat: number | null;
	/** Tax amount */
	tax: number | null;
	/** Discount amount */
	discount: number | null;
	/** From/sender details (rich text) */
	fromDetails: EditorDoc | null;
	/** Customer/recipient details (rich text) */
	customerDetails: EditorDoc | null;
	/** Payment details (rich text) */
	paymentDetails: EditorDoc | null;
	/** Notes (rich text) */
	noteDetails: EditorDoc | null;
	/** Top custom block (rich text) */
	topBlock: EditorDoc | null;
	/** Bottom custom block (rich text) */
	bottomBlock: EditorDoc | null;
	/** Internal note (not shown on invoice) */
	internalNote: string | null;
	/** Customer name (for display) */
	customerName: string | null;
	/** Customer ID reference */
	customerId: string | null;
	/** Template settings */
	template: InvoiceTemplate;
	/** Secure token for public access */
	token: string;
	/** File paths for attachments */
	filePath: string[] | null;
	/** When invoice was sent */
	sentAt: string | null;
	/** Email address invoice was sent to */
	sentTo: string | null;
	/** When invoice was viewed */
	viewedAt: string | null;
	/** When invoice was paid */
	paidAt: string | null;
	/** When reminder was sent */
	reminderSentAt: string | null;
	/** Created timestamp */
	createdAt: string;
	/** Updated timestamp */
	updatedAt: string | null;
}

// ============================================================================
// Template
// ============================================================================

export interface InvoiceTemplate {
	// Labels
	title: string;
	fromLabel: string;
	customerLabel: string;
	invoiceNoLabel: string;
	issueDateLabel: string;
	dueDateLabel: string;
	descriptionLabel: string;
	quantityLabel: string;
	priceLabel: string;
	totalLabel: string;
	subtotalLabel: string;
	totalSummaryLabel: string;
	vatLabel: string;
	taxLabel: string;
	discountLabel: string;
	paymentLabel: string;
	noteLabel: string;
	lineItemTaxLabel?: string;

	// Settings
	currency: string;
	locale: string;
	timezone: string;
	dateFormat: string;
	size: "a4" | "letter";

	// Tax/VAT
	includeVat: boolean;
	includeTax: boolean;
	includeDiscount: boolean;
	includeLineItemTax?: boolean;
	vatRate: number;
	taxRate: number;

	// Display
	includeDecimals: boolean;
	includeUnits: boolean;
	includeQr: boolean;

	// Branding
	logoUrl: string | null;

	// Default content
	fromDetails: EditorDoc | null;
	paymentDetails: EditorDoc | null;
	noteDetails: EditorDoc | null;

	// Delivery
	deliveryType: "create" | "create_and_send" | "scheduled";
}

// ============================================================================
// Rich Text Editor Types
// ============================================================================

export interface EditorDoc {
	type: "doc";
	content: EditorNode[];
}

export interface EditorNode {
	type: string;
	content?: InlineContent[];
	attrs?: Record<string, unknown>;
}

export interface InlineContent {
	type: string;
	text?: string;
	marks?: Mark[];
}

export interface Mark {
	type: string;
	attrs?: {
		href?: string;
		[key: string]: unknown;
	};
}

// ============================================================================
// Customer
// ============================================================================

export interface CustomerData {
	name?: string | null;
	email?: string | null;
	phone?: string | null;
	website?: string | null;
	addressLine1?: string | null;
	addressLine2?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	country?: string | null;
	taxId?: string | null;
}

// ============================================================================
// Product (for line item autocomplete)
// ============================================================================

export interface InvoiceProduct {
	id: string;
	name: string;
	description: string | null;
	price: number | null;
	currency: string | null;
	unit: string | null;
	taxRate: number | null;
}
