/**
 * HTML Invoice Template
 *
 * React component for rendering invoices as HTML (for preview, email, etc.)
 * This is a minimal template - customize for your UI library.
 */

import { calculateLineItemTotal, calculateTotal, formatCurrency } from "../../calculate.js";
import type { Invoice, LineItem } from "../../types.js";
import { extractTextFromContent } from "../../utils.js";

// ============================================================================
// Types
// ============================================================================

export interface HtmlTemplateProps {
	data: Invoice;
	/** Container width in pixels */
	width?: number;
	/** Container height in pixels */
	height?: number;
	/** Custom class name */
	className?: string;
}

// ============================================================================
// Components
// ============================================================================

function LineItemRow({
	item,
	currency,
	locale,
	includeDecimals,
	includeUnits,
}: {
	item: LineItem;
	currency: string;
	locale: string;
	includeDecimals: boolean;
	includeUnits: boolean;
}) {
	const total = calculateLineItemTotal(item);

	return (
		<tr style={{ borderBottom: "1px solid #e5e5e5" }}>
			<td style={{ padding: "12px 0", textAlign: "left" }}>
				{item.name}
				{includeUnits && item.unit && (
					<span style={{ color: "#666", marginLeft: "4px" }}>({item.unit})</span>
				)}
			</td>
			<td style={{ padding: "12px 0", textAlign: "right" }}>{item.quantity ?? 1}</td>
			<td style={{ padding: "12px 0", textAlign: "right" }}>
				{formatCurrency(item.price ?? 0, currency, locale, { includeDecimals })}
			</td>
			<td style={{ padding: "12px 0", textAlign: "right" }}>
				{formatCurrency(total, currency, locale, { includeDecimals })}
			</td>
		</tr>
	);
}

function SummaryRow({
	label,
	value,
	isBold = false,
}: {
	label: string;
	value: string;
	isBold?: boolean;
}) {
	return (
		<tr>
			<td
				style={{
					padding: "8px 0",
					textAlign: "right",
					fontWeight: isBold ? 600 : 400,
				}}
			>
				{label}
			</td>
			<td
				style={{
					padding: "8px 0",
					textAlign: "right",
					fontWeight: isBold ? 600 : 400,
					paddingLeft: "24px",
				}}
			>
				{value}
			</td>
		</tr>
	);
}

// ============================================================================
// Main Template
// ============================================================================

export function HtmlTemplate({ data, width = 800, className }: HtmlTemplateProps) {
	if (!data) return null;

	const {
		invoiceNumber,
		issueDate,
		dueDate,
		template,
		lineItems,
		customerDetails,
		fromDetails,
		paymentDetails,
		noteDetails,
		currency,
		discount,
	} = data;

	const curr = currency ?? template.currency ?? "USD";
	const locale = template.locale ?? "en-US";

	const totals = calculateTotal({
		lineItems,
		taxRate: template.taxRate,
		vatRate: template.vatRate,
		discount: discount ?? 0,
		includeVat: template.includeVat,
		includeTax: template.includeTax,
		includeLineItemTax: template.includeLineItemTax,
	});

	const formatDate = (date: string | null) => {
		if (!date) return "";
		return new Date(date).toLocaleDateString(locale);
	};

	return (
		<div
			className={className}
			style={{
				maxWidth: width,
				margin: "0 auto",
				padding: "32px",
				fontFamily: "system-ui, -apple-system, sans-serif",
				fontSize: "14px",
				lineHeight: 1.5,
				color: "#111",
				backgroundColor: "#fff",
			}}
		>
			{/* Header */}
			<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
				<div>
					<h1 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>{template.title}</h1>
					<div style={{ marginTop: "16px", color: "#666" }}>
						<div>
							<strong>{template.invoiceNoLabel}:</strong> {invoiceNumber}
						</div>
						<div>
							<strong>{template.issueDateLabel}:</strong> {formatDate(issueDate)}
						</div>
						<div>
							<strong>{template.dueDateLabel}:</strong> {formatDate(dueDate)}
						</div>
					</div>
				</div>
				{template.logoUrl && (
					<img
						src={template.logoUrl}
						alt="Logo"
						style={{ maxHeight: "80px", objectFit: "contain" }}
					/>
				)}
			</div>

			{/* From / To */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "32px",
					marginBottom: "32px",
				}}
			>
				<div>
					<div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
						{template.fromLabel}
					</div>
					<div style={{ whiteSpace: "pre-line" }}>{extractTextFromContent(fromDetails)}</div>
				</div>
				<div>
					<div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
						{template.customerLabel}
					</div>
					<div style={{ whiteSpace: "pre-line" }}>{extractTextFromContent(customerDetails)}</div>
				</div>
			</div>

			{/* Line Items */}
			<table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "32px" }}>
				<thead>
					<tr style={{ borderBottom: "2px solid #111" }}>
						<th style={{ padding: "12px 0", textAlign: "left" }}>{template.descriptionLabel}</th>
						<th style={{ padding: "12px 0", textAlign: "right" }}>{template.quantityLabel}</th>
						<th style={{ padding: "12px 0", textAlign: "right" }}>{template.priceLabel}</th>
						<th style={{ padding: "12px 0", textAlign: "right" }}>{template.totalLabel}</th>
					</tr>
				</thead>
				<tbody>
					{lineItems.map((item, index) => (
						<LineItemRow
							key={index}
							item={item}
							currency={curr}
							locale={locale}
							includeDecimals={template.includeDecimals}
							includeUnits={template.includeUnits}
						/>
					))}
				</tbody>
			</table>

			{/* Summary */}
			<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
				<table style={{ minWidth: "250px" }}>
					<tbody>
						<SummaryRow
							label={template.subtotalLabel}
							value={formatCurrency(totals.subTotal, curr, locale, {
								includeDecimals: template.includeDecimals,
							})}
						/>
						{template.includeVat && totals.vat > 0 && (
							<SummaryRow
								label={`${template.vatLabel} (${template.vatRate}%)`}
								value={formatCurrency(totals.vat, curr, locale, {
									includeDecimals: template.includeDecimals,
								})}
							/>
						)}
						{(template.includeTax || template.includeLineItemTax) && totals.tax > 0 && (
							<SummaryRow
								label={template.taxLabel}
								value={formatCurrency(totals.tax, curr, locale, {
									includeDecimals: template.includeDecimals,
								})}
							/>
						)}
						{template.includeDiscount && (discount ?? 0) > 0 && (
							<SummaryRow
								label={template.discountLabel}
								value={`-${formatCurrency(discount ?? 0, curr, locale, {
									includeDecimals: template.includeDecimals,
								})}`}
							/>
						)}
						<SummaryRow
							label={template.totalSummaryLabel}
							value={formatCurrency(totals.total, curr, locale, {
								includeDecimals: template.includeDecimals,
							})}
							isBold
						/>
					</tbody>
				</table>
			</div>

			{/* Footer */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
				{paymentDetails && (
					<div>
						<div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
							{template.paymentLabel}
						</div>
						<div style={{ whiteSpace: "pre-line" }}>{extractTextFromContent(paymentDetails)}</div>
					</div>
				)}
				{noteDetails && (
					<div>
						<div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
							{template.noteLabel}
						</div>
						<div style={{ whiteSpace: "pre-line" }}>{extractTextFromContent(noteDetails)}</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default HtmlTemplate;
