/**
 * Stripe Customer management utilities
 *
 * @example
 * ```ts
 * import { createStripe } from "@repo/payments/stripe";
 * import {
 *   createCustomer,
 *   getOrCreateCustomer,
 *   updateCustomer,
 * } from "@repo/payments/stripe/customers";
 *
 * const stripe = createStripe(env.STRIPE_SECRET_KEY);
 *
 * // Create customer
 * const customer = await createCustomer(stripe, {
 *   email: "user@example.com",
 *   name: "John Doe",
 *   metadata: { userId: "123" },
 * });
 *
 * // Get or create by email
 * const customer = await getOrCreateCustomer(stripe, "user@example.com", {
 *   name: "John Doe",
 * });
 * ```
 */

import type Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export interface CreateCustomerOptions {
	/** Customer email */
	email: string;
	/** Customer name */
	name?: string;
	/** Phone number */
	phone?: string;
	/** Description */
	description?: string;
	/** Metadata */
	metadata?: Record<string, string>;
	/** Payment method to attach */
	paymentMethod?: string;
	/** Address */
	address?: Stripe.AddressParam;
	/** Shipping address */
	shipping?: Stripe.CustomerCreateParams.Shipping;
}

export interface UpdateCustomerOptions {
	/** Customer email */
	email?: string;
	/** Customer name */
	name?: string;
	/** Phone number */
	phone?: string;
	/** Description */
	description?: string;
	/** Metadata (merged with existing) */
	metadata?: Record<string, string>;
	/** Default payment method */
	defaultPaymentMethod?: string;
	/** Address */
	address?: Stripe.AddressParam;
}

export interface CustomerInfo {
	id: string;
	email: string | null;
	name: string | null;
	phone: string | null;
	created: Date;
	metadata: Record<string, string>;
	defaultPaymentMethodId: string | null;
	balance: number;
	currency: string | null;
}

// ============================================================================
// Customer Creation
// ============================================================================

/**
 * Create a new customer
 */
export async function createCustomer(
	stripe: Stripe,
	options: CreateCustomerOptions,
): Promise<Stripe.Customer> {
	const params: Stripe.CustomerCreateParams = {
		email: options.email,
	};

	if (options.name) params.name = options.name;
	if (options.phone) params.phone = options.phone;
	if (options.description) params.description = options.description;
	if (options.metadata) params.metadata = options.metadata;
	if (options.paymentMethod) params.payment_method = options.paymentMethod;
	if (options.address) params.address = options.address;
	if (options.shipping) params.shipping = options.shipping;

	return stripe.customers.create(params);
}

/**
 * Get or create a customer by email
 */
export async function getOrCreateCustomer(
	stripe: Stripe,
	email: string,
	createOptions: Omit<CreateCustomerOptions, "email"> = {},
): Promise<Stripe.Customer> {
	// Search for existing customer
	const existing = await stripe.customers.list({
		email,
		limit: 1,
	});

	if (existing.data.length > 0) {
		return existing.data[0];
	}

	// Create new customer
	return createCustomer(stripe, { email, ...createOptions });
}

// ============================================================================
// Customer Retrieval
// ============================================================================

/**
 * Get a customer by ID
 */
export async function getCustomer(
	stripe: Stripe,
	customerId: string,
	options: { expand?: string[] } = {},
): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
	return stripe.customers.retrieve(customerId, {
		expand: options.expand,
	});
}

/**
 * Get customer with expanded data
 */
export async function getCustomerExpanded(
	stripe: Stripe,
	customerId: string,
): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
	return stripe.customers.retrieve(customerId, {
		expand: ["default_source", "subscriptions"],
	});
}

/**
 * Search customers by email
 */
export async function findCustomerByEmail(
	stripe: Stripe,
	email: string,
): Promise<Stripe.Customer | null> {
	const customers = await stripe.customers.list({
		email,
		limit: 1,
	});
	return customers.data[0] ?? null;
}

/**
 * Search customers by metadata
 */
export async function findCustomerByMetadata(
	stripe: Stripe,
	key: string,
	value: string,
): Promise<Stripe.Customer | null> {
	const customers = await stripe.customers.search({
		query: `metadata["${key}"]:"${value}"`,
		limit: 1,
	});
	return customers.data[0] ?? null;
}

/**
 * Parse customer into simpler format
 */
export function parseCustomer(customer: Stripe.Customer): CustomerInfo {
	return {
		id: customer.id,
		email: customer.email,
		name: customer.name ?? null,
		phone: customer.phone ?? null,
		created: new Date(customer.created * 1000),
		metadata: (customer.metadata as Record<string, string>) ?? {},
		defaultPaymentMethodId:
			typeof customer.invoice_settings?.default_payment_method === "string"
				? customer.invoice_settings.default_payment_method
				: (customer.invoice_settings?.default_payment_method?.id ?? null),
		balance: customer.balance,
		currency: customer.currency ?? null,
	};
}

// ============================================================================
// Customer Updates
// ============================================================================

/**
 * Update a customer
 */
export async function updateCustomer(
	stripe: Stripe,
	customerId: string,
	options: UpdateCustomerOptions,
): Promise<Stripe.Customer> {
	const params: Stripe.CustomerUpdateParams = {};

	if (options.email) params.email = options.email;
	if (options.name) params.name = options.name;
	if (options.phone) params.phone = options.phone;
	if (options.description) params.description = options.description;
	if (options.metadata) params.metadata = options.metadata;
	if (options.address) params.address = options.address;
	if (options.defaultPaymentMethod) {
		params.invoice_settings = {
			default_payment_method: options.defaultPaymentMethod,
		};
	}

	return stripe.customers.update(customerId, params);
}

/**
 * Delete a customer
 */
export async function deleteCustomer(
	stripe: Stripe,
	customerId: string,
): Promise<Stripe.DeletedCustomer> {
	return stripe.customers.del(customerId);
}

// ============================================================================
// Payment Methods
// ============================================================================

/**
 * List payment methods for a customer
 */
export async function listPaymentMethods(
	stripe: Stripe,
	customerId: string,
	type: Stripe.PaymentMethodListParams.Type = "card",
): Promise<Stripe.PaymentMethod[]> {
	const methods = await stripe.paymentMethods.list({
		customer: customerId,
		type,
	});
	return methods.data;
}

/**
 * Attach a payment method to a customer
 */
export async function attachPaymentMethod(
	stripe: Stripe,
	paymentMethodId: string,
	customerId: string,
): Promise<Stripe.PaymentMethod> {
	return stripe.paymentMethods.attach(paymentMethodId, {
		customer: customerId,
	});
}

/**
 * Detach a payment method from a customer
 */
export async function detachPaymentMethod(
	stripe: Stripe,
	paymentMethodId: string,
): Promise<Stripe.PaymentMethod> {
	return stripe.paymentMethods.detach(paymentMethodId);
}

/**
 * Set default payment method for a customer
 */
export async function setDefaultPaymentMethod(
	stripe: Stripe,
	customerId: string,
	paymentMethodId: string,
): Promise<Stripe.Customer> {
	return stripe.customers.update(customerId, {
		invoice_settings: {
			default_payment_method: paymentMethodId,
		},
	});
}

// ============================================================================
// Invoices
// ============================================================================

/**
 * List invoices for a customer
 */
export async function listCustomerInvoices(
	stripe: Stripe,
	customerId: string,
	options: { limit?: number; status?: Stripe.InvoiceListParams.Status } = {},
): Promise<Stripe.Invoice[]> {
	const invoices = await stripe.invoices.list({
		customer: customerId,
		limit: options.limit ?? 10,
		status: options.status,
	});
	return invoices.data;
}

/**
 * Get upcoming invoice for a customer
 */
export async function getUpcomingInvoice(
	stripe: Stripe,
	customerId: string,
): Promise<Stripe.UpcomingInvoice | null> {
	try {
		return await stripe.invoices.retrieveUpcoming({
			customer: customerId,
		});
	} catch {
		// No upcoming invoice
		return null;
	}
}

// ============================================================================
// Balance
// ============================================================================

/**
 * Add credit to customer balance
 */
export async function addCustomerCredit(
	stripe: Stripe,
	customerId: string,
	amount: number,
	currency = "usd",
	description?: string,
): Promise<Stripe.CustomerBalanceTransaction> {
	return stripe.customers.createBalanceTransaction(customerId, {
		amount: -amount, // Negative = credit
		currency,
		description,
	});
}

/**
 * Get customer balance transactions
 */
export async function getBalanceTransactions(
	stripe: Stripe,
	customerId: string,
	limit = 10,
): Promise<Stripe.CustomerBalanceTransaction[]> {
	const transactions = await stripe.customers.listBalanceTransactions(customerId, {
		limit,
	});
	return transactions.data;
}
