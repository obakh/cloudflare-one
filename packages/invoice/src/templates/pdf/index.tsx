/**
 * PDF Invoice Template
 *
 * React-PDF component for generating invoice PDFs
 *
 * @example
 * ```ts
 * import { PdfTemplate, renderToBuffer } from "@repo/invoice/templates/pdf";
 *
 * const pdfBuffer = await renderToBuffer(<PdfTemplate data={invoice} />);
 * ```
 */

import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { calculateLineItemTotal, calculateTotal, formatCurrency } from "../../calculate.js";
import type { Invoice, LineItem } from "../../types.js";
import { extractTextFromContent } from "../../utils.js";

// Re-export render functions
export { renderToBuffer, renderToStream } from "@react-pdf/renderer";

// ============================================================================
// Fonts
// ============================================================================

Font.register({
	family: "Inter",
	fonts: [
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
			fontWeight: 400,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
			fontWeight: 500,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
			fontWeight: 600,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
			fontWeight: 700,
		},
	],
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
	page: {
		padding: 40,
		backgroundColor: "#fff",
		fontFamily: "Inter",
		fontSize: 10,
		color: "#111",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 30,
	},
	title: {
		fontSize: 24,
		fontWeight: 600,
	},
	meta: {
		marginTop: 10,
	},
	metaRow: {
		flexDirection: "row",
		marginBottom: 4,
	},
	metaLabel: {
		fontWeight: 500,
		marginRight: 8,
	},
	logo: {
		maxHeight: 60,
		objectFit: "contain",
	},
	parties: {
		flexDirection: "row",
		marginBottom: 30,
	},
	party: {
		flex: 1,
	},
	partyLabel: {
		fontSize: 9,
		color: "#666",
		marginBottom: 6,
	},
	table: {
		marginBottom: 30,
	},
	tableHeader: {
		flexDirection: "row",
		borderBottomWidth: 2,
		borderBottomColor: "#111",
		paddingBottom: 8,
		marginBottom: 8,
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#e5e5e5",
		paddingVertical: 8,
	},
	colDescription: {
		flex: 3,
	},
	colQuantity: {
		flex: 1,
		textAlign: "right",
	},
	colPrice: {
		flex: 1,
		textAlign: "right",
	},
	colTotal: {
		flex: 1,
		textAlign: "right",
	},
	summary: {
		alignItems: "flex-end",
		marginBottom: 30,
	},
	summaryTable: {
		width: 200,
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 4,
	},
	summaryTotal: {
		fontWeight: 600,
		borderTopWidth: 1,
		borderTopColor: "#111",
		marginTop: 4,
		paddingTop: 8,
	},
	footer: {
		flexDirection: "row",
	},
	footerSection: {
		flex: 1,
		marginRight: 20,
	},
	footerLabel: {
		fontSize: 9,
		color: "#666",
		marginBottom: 6,
	},
});

// ============================================================================
// Components
// ============================================================================

function LineItemRow({
	item,
	currency,
	locale,
	includeDecimals,
}: {
	item: LineItem;
	currency: string;
	locale: string;
	includeDecimals: boolean;
}) {
	const total = calculateLineItemTotal(item);

	return (
		<View style={styles.tableRow}>
			<Text style={styles.colDescription}>{item.name}</Text>
			<Text style={styles.colQuantity}>{item.quantity ?? 1}</Text>
			<Text style={styles.colPrice}>
				{formatCurrency(item.price ?? 0, currency, locale, { includeDecimals })}
			</Text>
			<Text style={styles.colTotal}>
				{formatCurrency(total, currency, locale, { includeDecimals })}
			</Text>
		</View>
	);
}

// ============================================================================
// Main Template
// ============================================================================

export interface PdfTemplateProps {
	data: Invoice;
}

export function PdfTemplate({ data }: PdfTemplateProps) {
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
		<Document>
			<Page size={template.size.toUpperCase() as "A4" | "LETTER"} style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.title}>{template.title}</Text>
						<View style={styles.meta}>
							<View style={styles.metaRow}>
								<Text style={styles.metaLabel}>{template.invoiceNoLabel}:</Text>
								<Text>{invoiceNumber}</Text>
							</View>
							<View style={styles.metaRow}>
								<Text style={styles.metaLabel}>{template.issueDateLabel}:</Text>
								<Text>{formatDate(issueDate)}</Text>
							</View>
							<View style={styles.metaRow}>
								<Text style={styles.metaLabel}>{template.dueDateLabel}:</Text>
								<Text>{formatDate(dueDate)}</Text>
							</View>
						</View>
					</View>
					{template.logoUrl && <Image src={template.logoUrl} style={styles.logo} />}
				</View>

				{/* From / To */}
				<View style={styles.parties}>
					<View style={styles.party}>
						<Text style={styles.partyLabel}>{template.fromLabel}</Text>
						<Text>{extractTextFromContent(fromDetails)}</Text>
					</View>
					<View style={styles.party}>
						<Text style={styles.partyLabel}>{template.customerLabel}</Text>
						<Text>{extractTextFromContent(customerDetails)}</Text>
					</View>
				</View>

				{/* Line Items */}
				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<Text style={styles.colDescription}>{template.descriptionLabel}</Text>
						<Text style={styles.colQuantity}>{template.quantityLabel}</Text>
						<Text style={styles.colPrice}>{template.priceLabel}</Text>
						<Text style={styles.colTotal}>{template.totalLabel}</Text>
					</View>
					{lineItems.map((item, index) => (
						<LineItemRow
							key={index}
							item={item}
							currency={curr}
							locale={locale}
							includeDecimals={template.includeDecimals}
						/>
					))}
				</View>

				{/* Summary */}
				<View style={styles.summary}>
					<View style={styles.summaryTable}>
						<View style={styles.summaryRow}>
							<Text>{template.subtotalLabel}</Text>
							<Text>
								{formatCurrency(totals.subTotal, curr, locale, {
									includeDecimals: template.includeDecimals,
								})}
							</Text>
						</View>
						{template.includeVat && totals.vat > 0 && (
							<View style={styles.summaryRow}>
								<Text>
									{template.vatLabel} ({template.vatRate}%)
								</Text>
								<Text>
									{formatCurrency(totals.vat, curr, locale, {
										includeDecimals: template.includeDecimals,
									})}
								</Text>
							</View>
						)}
						{(template.includeTax || template.includeLineItemTax) && totals.tax > 0 && (
							<View style={styles.summaryRow}>
								<Text>{template.taxLabel}</Text>
								<Text>
									{formatCurrency(totals.tax, curr, locale, {
										includeDecimals: template.includeDecimals,
									})}
								</Text>
							</View>
						)}
						{template.includeDiscount && (discount ?? 0) > 0 && (
							<View style={styles.summaryRow}>
								<Text>{template.discountLabel}</Text>
								<Text>
									-
									{formatCurrency(discount ?? 0, curr, locale, {
										includeDecimals: template.includeDecimals,
									})}
								</Text>
							</View>
						)}
						<View style={[styles.summaryRow, styles.summaryTotal]}>
							<Text>{template.totalSummaryLabel}</Text>
							<Text>
								{formatCurrency(totals.total, curr, locale, {
									includeDecimals: template.includeDecimals,
								})}
							</Text>
						</View>
					</View>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					{paymentDetails && (
						<View style={styles.footerSection}>
							<Text style={styles.footerLabel}>{template.paymentLabel}</Text>
							<Text>{extractTextFromContent(paymentDetails)}</Text>
						</View>
					)}
					{noteDetails && (
						<View style={styles.footerSection}>
							<Text style={styles.footerLabel}>{template.noteLabel}</Text>
							<Text>{extractTextFromContent(noteDetails)}</Text>
						</View>
					)}
				</View>
			</Page>
		</Document>
	);
}

export default PdfTemplate;
