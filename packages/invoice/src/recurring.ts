/**
 * Recurring Invoice Utilities
 *
 * Handle recurring invoice scheduling, validation, and date calculations
 */

import { addDays, format, getDay, lastDayOfMonth } from "date-fns";

// ============================================================================
// Types
// ============================================================================

export const RECURRING_FREQUENCIES = [
	"weekly",
	"biweekly",
	"monthly_date",
	"monthly_weekday",
	"monthly_last_day",
	"quarterly",
	"semi_annual",
	"annual",
	"custom",
] as const;

export const RECURRING_STATUSES = ["active", "paused", "completed", "canceled"] as const;

export const RECURRING_END_TYPES = ["never", "on_date", "after_count"] as const;

export type RecurringFrequency = (typeof RECURRING_FREQUENCIES)[number];
export type RecurringStatus = (typeof RECURRING_STATUSES)[number];
export type RecurringEndType = (typeof RECURRING_END_TYPES)[number];

export interface RecurringConfig {
	frequency: RecurringFrequency;
	/** Day of week (0-6) or day of month (1-31) depending on frequency */
	frequencyDay: number | null;
	/** Week occurrence for monthly_weekday (1-5) */
	frequencyWeek: number | null;
	/** Custom interval in days */
	frequencyInterval: number | null;
	/** How the series ends */
	endType: RecurringEndType | null;
	/** End date for "on_date" end type */
	endDate: string | null;
	/** Number of invoices for "after_count" end type */
	endCount: number | null;
}

export interface UpcomingInvoice {
	date: Date;
	amount: number;
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Get start of day in UTC
 */
export function getStartOfDayUTC(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Convert local date to UTC midnight
 */
export function localDateToUTCMidnight(date: Date): string {
	return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
}

/**
 * Check if a date is in the future (UTC day comparison)
 */
export function isDateInFutureUTC(date: Date, now: Date = new Date()): boolean {
	const dateStartUTC = getStartOfDayUTC(date);
	const nowStartUTC = getStartOfDayUTC(now);
	return dateStartUTC.getTime() > nowStartUTC.getTime();
}

/**
 * Get the nth occurrence of a weekday in a month
 */
export function getNthWeekdayOfMonth(
	year: number,
	month: number,
	dayOfWeek: number,
	week: number,
): Date {
	let date = new Date(year, month, 1);
	const currentDayOfWeek = getDay(date);
	const daysUntilTarget =
		dayOfWeek >= currentDayOfWeek
			? dayOfWeek - currentDayOfWeek
			: 7 - (currentDayOfWeek - dayOfWeek);

	date = addDays(date, daysUntilTarget);
	date = addDays(date, (week - 1) * 7);

	return date;
}

// ============================================================================
// Frequency Labels
// ============================================================================

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];

/**
 * Format ordinal number (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(n: number): string {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

/**
 * Get human-readable frequency label
 */
export function getFrequencyLabel(
	frequency: RecurringFrequency,
	frequencyDay: number | null,
	frequencyWeek: number | null,
): string {
	switch (frequency) {
		case "weekly":
			return `Weekly on ${DAY_NAMES[frequencyDay ?? 0]}`;
		case "biweekly":
			return `Bi-weekly on ${DAY_NAMES[frequencyDay ?? 0]}`;
		case "monthly_date":
			return `Monthly on the ${formatOrdinal(frequencyDay ?? 1)}`;
		case "monthly_weekday":
			return `Monthly on the ${ORDINALS[(frequencyWeek ?? 1) - 1]} ${DAY_NAMES[frequencyDay ?? 0]}`;
		case "monthly_last_day":
			return "Monthly on the last day";
		case "quarterly":
			return `Quarterly on the ${formatOrdinal(frequencyDay ?? 1)}`;
		case "semi_annual":
			return `Semi-annually on the ${formatOrdinal(frequencyDay ?? 1)}`;
		case "annual":
			return `Annually on the ${formatOrdinal(frequencyDay ?? 1)}`;
		case "custom":
			return "Custom";
		default:
			return "Unknown";
	}
}

/**
 * Get short frequency label
 */
export function getFrequencyShortLabel(
	frequency: RecurringFrequency,
	frequencyInterval?: number | null,
): string {
	switch (frequency) {
		case "weekly":
			return "Weekly";
		case "biweekly":
			return "Bi-weekly";
		case "monthly_date":
		case "monthly_weekday":
		case "monthly_last_day":
			return "Monthly";
		case "quarterly":
			return "Quarterly";
		case "semi_annual":
			return "Semi-annual";
		case "annual":
			return "Annual";
		case "custom":
			return frequencyInterval ? `Every ${frequencyInterval} days` : "Custom";
		default:
			return "Unknown";
	}
}

// ============================================================================
// Date Calculations
// ============================================================================

/**
 * Calculate next invoice date based on frequency
 */
export function getNextDate(config: RecurringConfig, currentDate: Date): Date {
	switch (config.frequency) {
		case "weekly": {
			const next = new Date(currentDate);
			next.setDate(next.getDate() + 7);
			return next;
		}
		case "biweekly": {
			const next = new Date(currentDate);
			next.setDate(next.getDate() + 14);
			return next;
		}
		case "monthly_date": {
			const targetDay = config.frequencyDay ?? currentDate.getDate();
			const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
			const lastDay = lastDayOfMonth(nextMonth).getDate();
			nextMonth.setDate(Math.min(targetDay, lastDay));
			return nextMonth;
		}
		case "monthly_weekday": {
			const targetDayOfWeek = Math.min(Math.max(config.frequencyDay ?? 0, 0), 6);
			const targetWeek = Math.min(Math.max(config.frequencyWeek ?? 1, 1), 5);
			const nextMonth = new Date(currentDate);
			nextMonth.setMonth(nextMonth.getMonth() + 1);
			return getNthWeekdayOfMonth(
				nextMonth.getFullYear(),
				nextMonth.getMonth(),
				targetDayOfWeek,
				targetWeek,
			);
		}
		case "monthly_last_day": {
			const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
			return lastDayOfMonth(nextMonth);
		}
		case "quarterly": {
			const targetDay = config.frequencyDay ?? currentDate.getDate();
			const nextQuarter = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1);
			const lastDay = lastDayOfMonth(nextQuarter).getDate();
			nextQuarter.setDate(Math.min(targetDay, lastDay));
			return nextQuarter;
		}
		case "semi_annual": {
			const targetDay = config.frequencyDay ?? currentDate.getDate();
			const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 1);
			const lastDay = lastDayOfMonth(next).getDate();
			next.setDate(Math.min(targetDay, lastDay));
			return next;
		}
		case "annual": {
			const targetDay = config.frequencyDay ?? currentDate.getDate();
			const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 12, 1);
			const lastDay = lastDayOfMonth(next).getDate();
			next.setDate(Math.min(targetDay, lastDay));
			return next;
		}
		case "custom": {
			const next = new Date(currentDate);
			next.setDate(next.getDate() + (config.frequencyInterval ?? 1));
			return next;
		}
		default:
			return new Date(currentDate);
	}
}

/**
 * Calculate upcoming invoice dates for preview
 */
export function calculatePreviewDates(
	config: RecurringConfig,
	startDate: Date,
	amount: number,
	limit = 3,
): UpcomingInvoice[] {
	const invoices: UpcomingInvoice[] = [];
	let currentDate = new Date(startDate);

	for (let i = 0; i < limit; i++) {
		// Check end conditions
		if (config.endType === "on_date" && config.endDate) {
			if (currentDate > new Date(config.endDate)) break;
		}
		if (config.endType === "after_count" && config.endCount !== null) {
			if (i >= config.endCount) break;
		}

		invoices.push({ date: new Date(currentDate), amount });
		currentDate = getNextDate(config, currentDate);
	}

	return invoices;
}

/**
 * Calculate total invoices and amount for the series
 */
export function calculateSummary(
	config: RecurringConfig,
	startDate: Date,
	amount: number,
): { totalCount: number | null; totalAmount: number | null } {
	if (config.endType === "never") {
		return { totalCount: null, totalAmount: null };
	}

	if (config.endType === "after_count" && config.endCount !== null) {
		return {
			totalCount: config.endCount,
			totalAmount: config.endCount * amount,
		};
	}

	if (config.endType === "on_date" && config.endDate) {
		let count = 0;
		let currentDate = new Date(startDate);
		const endDate = new Date(config.endDate);

		while (currentDate <= endDate && count < 1000) {
			count++;
			currentDate = getNextDate(config, currentDate);
		}

		return { totalCount: count, totalAmount: count * amount };
	}

	return { totalCount: null, totalAmount: null };
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format day of week abbreviation
 */
export function formatDayOfWeek(date: string | Date): string {
	return format(new Date(date), "EEE");
}

/**
 * Format short date (e.g., "Jan 2")
 */
export function formatShortDate(date: string | Date): string {
	return format(new Date(date), "MMM d");
}

/**
 * Format recurring progress (e.g., "1 of 11")
 */
export function formatRecurringProgress(
	sequence: number | null,
	totalCount: number | null,
): string {
	if (sequence === null) return "";
	if (totalCount === null) return `${sequence}`;
	return `${sequence} of ${totalCount}`;
}

/**
 * Format next scheduled date
 */
export function formatNextScheduled(
	nextScheduledAt: string | Date | null,
	status: RecurringStatus,
): string {
	if (status === "completed") return "Series complete";
	if (status === "paused") return "Paused";
	if (!nextScheduledAt) return "";
	return `Next on ${format(new Date(nextScheduledAt), "MMM d")}`;
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationError {
	field: string;
	message: string;
}

/**
 * Validate recurring config
 */
export function validateRecurringConfig(config: RecurringConfig): ValidationError[] {
	const errors: ValidationError[] = [];

	// Weekly/biweekly require day of week
	if (config.frequency === "weekly" || config.frequency === "biweekly") {
		if (config.frequencyDay === null || config.frequencyDay === undefined) {
			errors.push({ field: "frequencyDay", message: "Day of week is required" });
		} else if (config.frequencyDay < 0 || config.frequencyDay > 6) {
			errors.push({ field: "frequencyDay", message: "Day of week must be 0-6" });
		}
	}

	// Monthly date requires day of month
	if (
		config.frequency === "monthly_date" ||
		config.frequency === "quarterly" ||
		config.frequency === "semi_annual" ||
		config.frequency === "annual"
	) {
		if (config.frequencyDay === null || config.frequencyDay === undefined) {
			errors.push({ field: "frequencyDay", message: "Day of month is required" });
		} else if (config.frequencyDay < 1 || config.frequencyDay > 31) {
			errors.push({ field: "frequencyDay", message: "Day of month must be 1-31" });
		}
	}

	// Monthly weekday requires day and week
	if (config.frequency === "monthly_weekday") {
		if (config.frequencyDay === null) {
			errors.push({ field: "frequencyDay", message: "Day of week is required" });
		}
		if (config.frequencyWeek === null) {
			errors.push({ field: "frequencyWeek", message: "Week occurrence is required" });
		} else if (config.frequencyWeek < 1 || config.frequencyWeek > 5) {
			errors.push({ field: "frequencyWeek", message: "Week must be 1-5" });
		}
	}

	// Custom requires interval
	if (config.frequency === "custom") {
		if (config.frequencyInterval === null) {
			errors.push({ field: "frequencyInterval", message: "Day interval is required" });
		} else if (config.frequencyInterval < 1) {
			errors.push({ field: "frequencyInterval", message: "Interval must be at least 1" });
		}
	}

	// End type validations
	if (config.endType === "on_date" && !config.endDate) {
		errors.push({ field: "endDate", message: "End date is required" });
	}
	if (config.endType === "after_count") {
		if (config.endCount === null) {
			errors.push({ field: "endCount", message: "Invoice count is required" });
		} else if (config.endCount < 1) {
			errors.push({ field: "endCount", message: "Count must be at least 1" });
		}
	}

	return errors;
}

/**
 * Check if config is valid
 */
export function isValidRecurringConfig(config: RecurringConfig): boolean {
	return validateRecurringConfig(config).length === 0;
}
