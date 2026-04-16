/**
 * Timezone Data
 *
 * IANA timezone database with UTC offsets and display names.
 */

export interface Timezone {
	id: string;
	name: string;
	offset: string;
	offsetMinutes: number;
}

/**
 * Common timezones with offsets
 */
export const TIMEZONES: Timezone[] = [
	{ id: "Pacific/Midway", name: "Midway Island", offset: "UTC-11:00", offsetMinutes: -660 },
	{ id: "Pacific/Honolulu", name: "Hawaii", offset: "UTC-10:00", offsetMinutes: -600 },
	{ id: "America/Anchorage", name: "Alaska", offset: "UTC-09:00", offsetMinutes: -540 },
	{
		id: "America/Los_Angeles",
		name: "Pacific Time (US & Canada)",
		offset: "UTC-08:00",
		offsetMinutes: -480,
	},
	{
		id: "America/Denver",
		name: "Mountain Time (US & Canada)",
		offset: "UTC-07:00",
		offsetMinutes: -420,
	},
	{ id: "America/Phoenix", name: "Arizona", offset: "UTC-07:00", offsetMinutes: -420 },
	{
		id: "America/Chicago",
		name: "Central Time (US & Canada)",
		offset: "UTC-06:00",
		offsetMinutes: -360,
	},
	{ id: "America/Mexico_City", name: "Mexico City", offset: "UTC-06:00", offsetMinutes: -360 },
	{
		id: "America/New_York",
		name: "Eastern Time (US & Canada)",
		offset: "UTC-05:00",
		offsetMinutes: -300,
	},
	{ id: "America/Bogota", name: "Bogota", offset: "UTC-05:00", offsetMinutes: -300 },
	{ id: "America/Lima", name: "Lima", offset: "UTC-05:00", offsetMinutes: -300 },
	{ id: "America/Caracas", name: "Caracas", offset: "UTC-04:00", offsetMinutes: -240 },
	{
		id: "America/Halifax",
		name: "Atlantic Time (Canada)",
		offset: "UTC-04:00",
		offsetMinutes: -240,
	},
	{ id: "America/Santiago", name: "Santiago", offset: "UTC-04:00", offsetMinutes: -240 },
	{ id: "America/Sao_Paulo", name: "Sao Paulo", offset: "UTC-03:00", offsetMinutes: -180 },
	{ id: "America/Buenos_Aires", name: "Buenos Aires", offset: "UTC-03:00", offsetMinutes: -180 },
	{ id: "Atlantic/South_Georgia", name: "Mid-Atlantic", offset: "UTC-02:00", offsetMinutes: -120 },
	{ id: "Atlantic/Azores", name: "Azores", offset: "UTC-01:00", offsetMinutes: -60 },
	{ id: "UTC", name: "UTC", offset: "UTC+00:00", offsetMinutes: 0 },
	{ id: "Europe/London", name: "London", offset: "UTC+00:00", offsetMinutes: 0 },
	{ id: "Europe/Dublin", name: "Dublin", offset: "UTC+00:00", offsetMinutes: 0 },
	{ id: "Europe/Lisbon", name: "Lisbon", offset: "UTC+00:00", offsetMinutes: 0 },
	{ id: "Africa/Casablanca", name: "Casablanca", offset: "UTC+00:00", offsetMinutes: 0 },
	{ id: "Europe/Paris", name: "Paris", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Berlin", name: "Berlin", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Amsterdam", name: "Amsterdam", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Brussels", name: "Brussels", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Madrid", name: "Madrid", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Rome", name: "Rome", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Stockholm", name: "Stockholm", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Vienna", name: "Vienna", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Warsaw", name: "Warsaw", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Africa/Lagos", name: "Lagos", offset: "UTC+01:00", offsetMinutes: 60 },
	{ id: "Europe/Athens", name: "Athens", offset: "UTC+02:00", offsetMinutes: 120 },
	{ id: "Europe/Bucharest", name: "Bucharest", offset: "UTC+02:00", offsetMinutes: 120 },
	{ id: "Europe/Helsinki", name: "Helsinki", offset: "UTC+02:00", offsetMinutes: 120 },
	{ id: "Europe/Kiev", name: "Kyiv", offset: "UTC+02:00", offsetMinutes: 120 },
	{ id: "Africa/Cairo", name: "Cairo", offset: "UTC+02:00", offsetMinutes: 120 },
	{ id: "Africa/Johannesburg", name: "Johannesburg", offset: "UTC+02:00", offsetMinutes: 120 },
	{ id: "Asia/Jerusalem", name: "Jerusalem", offset: "UTC+02:00", offsetMinutes: 120 },
	{ id: "Europe/Istanbul", name: "Istanbul", offset: "UTC+03:00", offsetMinutes: 180 },
	{ id: "Europe/Moscow", name: "Moscow", offset: "UTC+03:00", offsetMinutes: 180 },
	{ id: "Asia/Kuwait", name: "Kuwait", offset: "UTC+03:00", offsetMinutes: 180 },
	{ id: "Asia/Riyadh", name: "Riyadh", offset: "UTC+03:00", offsetMinutes: 180 },
	{ id: "Africa/Nairobi", name: "Nairobi", offset: "UTC+03:00", offsetMinutes: 180 },
	{ id: "Asia/Tehran", name: "Tehran", offset: "UTC+03:30", offsetMinutes: 210 },
	{ id: "Asia/Dubai", name: "Dubai", offset: "UTC+04:00", offsetMinutes: 240 },
	{ id: "Asia/Baku", name: "Baku", offset: "UTC+04:00", offsetMinutes: 240 },
	{ id: "Asia/Kabul", name: "Kabul", offset: "UTC+04:30", offsetMinutes: 270 },
	{ id: "Asia/Karachi", name: "Karachi", offset: "UTC+05:00", offsetMinutes: 300 },
	{ id: "Asia/Tashkent", name: "Tashkent", offset: "UTC+05:00", offsetMinutes: 300 },
	{
		id: "Asia/Kolkata",
		name: "Mumbai, Kolkata, New Delhi",
		offset: "UTC+05:30",
		offsetMinutes: 330,
	},
	{ id: "Asia/Kathmandu", name: "Kathmandu", offset: "UTC+05:45", offsetMinutes: 345 },
	{ id: "Asia/Dhaka", name: "Dhaka", offset: "UTC+06:00", offsetMinutes: 360 },
	{ id: "Asia/Almaty", name: "Almaty", offset: "UTC+06:00", offsetMinutes: 360 },
	{ id: "Asia/Yangon", name: "Yangon", offset: "UTC+06:30", offsetMinutes: 390 },
	{ id: "Asia/Bangkok", name: "Bangkok", offset: "UTC+07:00", offsetMinutes: 420 },
	{ id: "Asia/Jakarta", name: "Jakarta", offset: "UTC+07:00", offsetMinutes: 420 },
	{ id: "Asia/Ho_Chi_Minh", name: "Ho Chi Minh", offset: "UTC+07:00", offsetMinutes: 420 },
	{ id: "Asia/Singapore", name: "Singapore", offset: "UTC+08:00", offsetMinutes: 480 },
	{ id: "Asia/Hong_Kong", name: "Hong Kong", offset: "UTC+08:00", offsetMinutes: 480 },
	{ id: "Asia/Shanghai", name: "Beijing, Shanghai", offset: "UTC+08:00", offsetMinutes: 480 },
	{ id: "Asia/Taipei", name: "Taipei", offset: "UTC+08:00", offsetMinutes: 480 },
	{ id: "Asia/Kuala_Lumpur", name: "Kuala Lumpur", offset: "UTC+08:00", offsetMinutes: 480 },
	{ id: "Australia/Perth", name: "Perth", offset: "UTC+08:00", offsetMinutes: 480 },
	{ id: "Asia/Seoul", name: "Seoul", offset: "UTC+09:00", offsetMinutes: 540 },
	{ id: "Asia/Tokyo", name: "Tokyo", offset: "UTC+09:00", offsetMinutes: 540 },
	{ id: "Australia/Darwin", name: "Darwin", offset: "UTC+09:30", offsetMinutes: 570 },
	{ id: "Australia/Adelaide", name: "Adelaide", offset: "UTC+09:30", offsetMinutes: 570 },
	{ id: "Australia/Brisbane", name: "Brisbane", offset: "UTC+10:00", offsetMinutes: 600 },
	{ id: "Australia/Sydney", name: "Sydney", offset: "UTC+10:00", offsetMinutes: 600 },
	{ id: "Australia/Melbourne", name: "Melbourne", offset: "UTC+10:00", offsetMinutes: 600 },
	{ id: "Pacific/Guam", name: "Guam", offset: "UTC+10:00", offsetMinutes: 600 },
	{ id: "Pacific/Noumea", name: "Noumea", offset: "UTC+11:00", offsetMinutes: 660 },
	{ id: "Pacific/Auckland", name: "Auckland", offset: "UTC+12:00", offsetMinutes: 720 },
	{ id: "Pacific/Fiji", name: "Fiji", offset: "UTC+12:00", offsetMinutes: 720 },
	{ id: "Pacific/Tongatapu", name: "Tongatapu", offset: "UTC+13:00", offsetMinutes: 780 },
];

/**
 * Country to timezone mapping (primary timezone)
 */
export const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
	US: "America/New_York",
	GB: "Europe/London",
	FR: "Europe/Paris",
	DE: "Europe/Berlin",
	JP: "Asia/Tokyo",
	CN: "Asia/Shanghai",
	AU: "Australia/Sydney",
	CA: "America/Toronto",
	BR: "America/Sao_Paulo",
	IN: "Asia/Kolkata",
	RU: "Europe/Moscow",
	KR: "Asia/Seoul",
	MX: "America/Mexico_City",
	ES: "Europe/Madrid",
	IT: "Europe/Rome",
	NL: "Europe/Amsterdam",
	SE: "Europe/Stockholm",
	NO: "Europe/Oslo",
	DK: "Europe/Copenhagen",
	FI: "Europe/Helsinki",
	PL: "Europe/Warsaw",
	AT: "Europe/Vienna",
	CH: "Europe/Zurich",
	BE: "Europe/Brussels",
	PT: "Europe/Lisbon",
	GR: "Europe/Athens",
	TR: "Europe/Istanbul",
	IL: "Asia/Jerusalem",
	AE: "Asia/Dubai",
	SA: "Asia/Riyadh",
	EG: "Africa/Cairo",
	ZA: "Africa/Johannesburg",
	NG: "Africa/Lagos",
	KE: "Africa/Nairobi",
	SG: "Asia/Singapore",
	HK: "Asia/Hong_Kong",
	TW: "Asia/Taipei",
	TH: "Asia/Bangkok",
	VN: "Asia/Ho_Chi_Minh",
	MY: "Asia/Kuala_Lumpur",
	ID: "Asia/Jakarta",
	PH: "Asia/Manila",
	PK: "Asia/Karachi",
	BD: "Asia/Dhaka",
	NZ: "Pacific/Auckland",
	AR: "America/Buenos_Aires",
	CL: "America/Santiago",
	CO: "America/Bogota",
	PE: "America/Lima",
	UA: "Europe/Kiev",
};

/**
 * Get timezone by ID
 */
export function getTimezone(id: string): Timezone | undefined {
	return TIMEZONES.find((tz) => tz.id === id);
}

/**
 * Get timezone for country
 */
export function getTimezoneForCountry(countryCode: string): Timezone | undefined {
	const tzId = COUNTRY_TIMEZONE_MAP[countryCode.toUpperCase()];
	return tzId ? getTimezone(tzId) : undefined;
}

/**
 * Get all timezones
 */
export function getAllTimezones(): Timezone[] {
	return [...TIMEZONES];
}

/**
 * Get timezones grouped by offset
 */
export function getTimezonesByOffset(): Map<number, Timezone[]> {
	const grouped = new Map<number, Timezone[]>();
	for (const tz of TIMEZONES) {
		const existing = grouped.get(tz.offsetMinutes) || [];
		existing.push(tz);
		grouped.set(tz.offsetMinutes, existing);
	}
	return grouped;
}

/**
 * Get current time in timezone
 */
export function getTimeInTimezone(timezoneId: string, date = new Date()): string {
	return date.toLocaleTimeString("en-US", {
		timeZone: timezoneId,
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

/**
 * Get date in timezone
 */
export function getDateInTimezone(timezoneId: string, date = new Date(), locale = "en-US"): string {
	return date.toLocaleDateString(locale, {
		timeZone: timezoneId,
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Convert date between timezones
 */
export function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
	const fromOffset = getTimezoneOffset(fromTimezone, date);
	const toOffset = getTimezoneOffset(toTimezone, date);
	const diff = toOffset - fromOffset;
	return new Date(date.getTime() + diff * 60 * 1000);
}

/**
 * Get timezone offset in minutes for a specific date
 */
function getTimezoneOffset(timezoneId: string, date: Date): number {
	const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
	const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezoneId }));
	return (tzDate.getTime() - utcDate.getTime()) / (60 * 1000);
}
