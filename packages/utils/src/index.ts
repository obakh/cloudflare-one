/**
 * Combines class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(" ");
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string, locale = "en-US"): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(length = 8): string {
	return Math.random()
		.toString(36)
		.substring(2, 2 + length);
}
