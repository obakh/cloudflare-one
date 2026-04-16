/**
 * Invoice Calculations
 *
 * Calculate totals, taxes, and line item amounts
 */

import type { LineItem } from "./types.js";

// ============================================================================
// Types
// ============================================================================

export interface CalculateTotalOptions {
	lineItems: LineItem[];
	/** Invoice-level tax rate (percentage, 0-100) */
	taxRate?: number;
	/** Invoice-level VAT rate (percentage, 0-100) */
	vatRate?: number;
	/** Discount amount (absolute value) */
	discount?: number;
	/** Include VAT in calculation */
	includeVat?: boolean;
	/** Include tax in calculation */
	includeTax?: boolean;
	/** Use per-line-item tax rates instead of invoice-level */
	includeLineItemTax?: boolean;
}

export interface CalculateTotalResult {
	/** Sum of line item totals (before tax/VAT) */
	subTotal: number;
	/** VAT amount */
	vat: number;
	/** Tax amount */
	tax: number;
	/** Final total (subtotal + vat + tax - discount) */
	total: number;
}

// ============================================================================
// Calculations
// ============================================================================

/**
 * Calculate invoice totals
 *
 * @example
 * ```ts
 * const result = calculateTotal({
 *   lineItems: [
 *     { name: "Service", price: 100, quantity: 2 },
 *     { name: "Product", price: 50, quantity: 1 },
 *   ],
 *   taxRate: 10,
 *   includeTax: true,
 *   discount: 25,
 * });
 * // { subTotal: 250, tax: 25, vat: 0, total: 250 }
 * ```
 */
export function calculateTotal(options: CalculateTotalOptions): CalculateTotalResult {
	const {
		lineItems = [],
		taxRate = 0,
		vatRate = 0,
		discount = 0,
		includeVat = false,
		includeTax = false,
		includeLineItemTax = false,
	} = options;

	// Calculate subtotal (sum of line item totals)
	const subTotal = lineItems.reduce((acc, item) => {
		if (!item) return acc;
		const price = item.price ?? 0;
		const quantity = item.quantity ?? 1;
		return acc + price * quantity;
	}, 0);

	// Calculate VAT on subtotal
	const vat = includeVat ? (subTotal * vatRate) / 100 : 0;

	// Calculate tax (either per-line-item or invoice-level)
	let tax = 0;
	if (includeLineItemTax) {
		// Sum of per-line-item taxes
		tax = lineItems.reduce((acc, item) => {
			if (!item) return acc;
			const itemTotal = (item.price ?? 0) * (item.quantity ?? 1);
			const itemTaxRate = item.taxRate ?? 0;
			return acc + (itemTotal * itemTaxRate) / 100;
		}, 0);
	} else if (includeTax) {
		// Invoice-level tax
		tax = (subTotal * taxRate) / 100;
	}

	// Calculate total
	const total = subTotal + vat + tax - (discount ?? 0);

	return {
		subTotal,
		vat,
		tax,
		total: Math.max(0, total), // Ensure non-negative
	};
}

/**
 * Calculate a single line item total
 */
export function calculateLineItemTotal(item: Pick<LineItem, "price" | "quantity">): number {
	const price = item.price ?? 0;
	const quantity = item.quantity ?? 1;
	return price * quantity;
}

/**
 * Calculate line item total with tax
 */
export function calculateLineItemTotalWithTax(
	item: Pick<LineItem, "price" | "quantity" | "taxRate">,
): { total: number; tax: number; totalWithTax: number } {
	const total = calculateLineItemTotal(item);
	const taxRate = item.taxRate ?? 0;
	const tax = (total * taxRate) / 100;
	return {
		total,
		tax,
		totalWithTax: total + tax,
	};
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format currency amount
 */
export function formatCurrency(
	amount: number,
	currency: string,
	locale: string = "en-US",
	options: { includeDecimals?: boolean } = {},
): string {
	const { includeDecimals = true } = options;

	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		minimumFractionDigits: includeDecimals ? 2 : 0,
		maximumFractionDigits: includeDecimals ? 2 : 0,
	}).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, locale: string = "en-US"): string {
	return new Intl.NumberFormat(locale, {
		style: "percent",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value / 100);
}
