/**
 * Bot Detection Helpers
 *
 * Utilities for detecting search engine crawlers and social media bots.
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
 */

/**
 * Known search engine crawlers
 */
export const SEARCH_ENGINE_BOTS = [
	"googlebot",
	"bingbot",
	"yandexbot",
	"baiduspider",
	"duckduckbot",
	"slurp", // Yahoo
	"sogou",
	"exabot",
	"ia_archiver", // Alexa
	"mj12bot", // Majestic
	"ahrefsbot",
	"semrushbot",
] as const;

/**
 * Social media and preview bots
 */
export const SOCIAL_BOTS = [
	"facebookexternalhit",
	"facebookcatalog",
	"twitterbot",
	"linkedinbot",
	"pinterest",
	"slackbot",
	"discordbot",
	"telegrambot",
	"whatsapp",
	"embedly",
	"quora link preview",
	"redditbot",
	"rogerbot",
	"showyoubot",
	"outbrain",
	"vkshare",
	"w3c_validator",
] as const;

/**
 * All known bots (search + social)
 */
export const ALL_BOTS = [...SEARCH_ENGINE_BOTS, ...SOCIAL_BOTS] as const;

/**
 * Bot detection result
 */
export interface BotDetectionResult {
	/** Whether the request is from a bot */
	isBot: boolean;
	/** Whether it's a search engine crawler */
	isSearchEngine: boolean;
	/** Whether it's a social media bot */
	isSocialBot: boolean;
	/** The detected bot name (if any) */
	botName?: string;
	/** The User-Agent string */
	userAgent: string;
}

/**
 * Create a regex pattern for bot detection
 */
function createBotPattern(bots: readonly string[]): RegExp {
	return new RegExp(`(${bots.join("|")})`, "i");
}

const searchEnginePattern = createBotPattern(SEARCH_ENGINE_BOTS);
const socialBotPattern = createBotPattern(SOCIAL_BOTS);

/**
 * Detect if a request is from a bot
 *
 * @example
 * ```ts
 * import { detectBot } from "@repo/seo/bots";
 *
 * const result = detectBot(request);
 * if (result.isBot) {
 *   console.log(`Bot detected: ${result.botName}`);
 * }
 * ```
 */
export function detectBot(request: Request): BotDetectionResult {
	const userAgent = request.headers.get("User-Agent") || "";

	const searchMatch = userAgent.match(searchEnginePattern);
	const socialMatch = userAgent.match(socialBotPattern);

	const isSearchEngine = !!searchMatch;
	const isSocialBot = !!socialMatch;
	const isBot = isSearchEngine || isSocialBot;

	let botName: string | undefined;
	if (searchMatch) {
		botName = searchMatch[1].toLowerCase();
	} else if (socialMatch) {
		botName = socialMatch[1].toLowerCase();
	}

	return {
		isBot,
		isSearchEngine,
		isSocialBot,
		botName,
		userAgent,
	};
}

/**
 * Check if request is from a specific bot
 *
 * @example
 * ```ts
 * if (isBot(request, "googlebot")) {
 *   // Handle Googlebot specifically
 * }
 * ```
 */
export function isBot(request: Request, botName: string): boolean {
	const userAgent = request.headers.get("User-Agent") || "";
	return userAgent.toLowerCase().includes(botName.toLowerCase());
}

/**
 * Check if request is from any search engine
 */
export function isSearchEngine(request: Request): boolean {
	const userAgent = request.headers.get("User-Agent") || "";
	return searchEnginePattern.test(userAgent);
}

/**
 * Check if request is from any social media bot
 */
export function isSocialBot(request: Request): boolean {
	const userAgent = request.headers.get("User-Agent") || "";
	return socialBotPattern.test(userAgent);
}

/**
 * Check if request wants HTML content
 */
export function wantsHtml(request: Request): boolean {
	const accept = request.headers.get("Accept") || "";
	return accept.includes("text/html");
}

/**
 * Check if request should receive prerendered content
 *
 * @example
 * ```ts
 * import { shouldPrerender } from "@repo/seo/bots";
 *
 * if (shouldPrerender(request)) {
 *   return prerenderResponse(request);
 * }
 * return fetch(request);
 * ```
 */
export function shouldPrerender(request: Request): boolean {
	// Only prerender GET requests
	if (request.method !== "GET") return false;

	// Only prerender HTML requests
	if (!wantsHtml(request)) return false;

	// Only prerender for bots
	const { isBot } = detectBot(request);
	return isBot;
}

/**
 * Bot detection options for custom configuration
 */
export interface BotDetectionOptions {
	/** Additional bot patterns to detect */
	additionalBots?: string[];
	/** Bot patterns to exclude from detection */
	excludeBots?: string[];
	/** Custom User-Agent patterns */
	customPatterns?: RegExp[];
}

/**
 * Create a custom bot detector
 *
 * @example
 * ```ts
 * const detector = createBotDetector({
 *   additionalBots: ["mybot", "customcrawler"],
 *   excludeBots: ["ahrefsbot"],
 * });
 *
 * const result = detector.detect(request);
 * ```
 */
export function createBotDetector(options: BotDetectionOptions = {}) {
	const { additionalBots = [], excludeBots = [], customPatterns = [] } = options;

	// Build bot list
	let bots = [...ALL_BOTS, ...additionalBots];
	if (excludeBots.length > 0) {
		const excludeSet = new Set(excludeBots.map((b) => b.toLowerCase()));
		bots = bots.filter((b) => !excludeSet.has(b.toLowerCase()));
	}

	const pattern = createBotPattern(bots);

	return {
		detect(request: Request): BotDetectionResult {
			const userAgent = request.headers.get("User-Agent") || "";

			// Check custom patterns first
			for (const customPattern of customPatterns) {
				if (customPattern.test(userAgent)) {
					return {
						isBot: true,
						isSearchEngine: false,
						isSocialBot: false,
						botName: "custom",
						userAgent,
					};
				}
			}

			const match = userAgent.match(pattern);
			const isBot = !!match;
			const botName = match ? match[1].toLowerCase() : undefined;

			return {
				isBot,
				isSearchEngine: isBot && SEARCH_ENGINE_BOTS.some((b) => b === botName),
				isSocialBot: isBot && SOCIAL_BOTS.some((b) => b === botName),
				botName,
				userAgent,
			};
		},

		shouldPrerender(request: Request): boolean {
			if (request.method !== "GET") return false;
			if (!wantsHtml(request)) return false;
			return this.detect(request).isBot;
		},
	};
}

/**
 * Verify Googlebot using reverse DNS (for critical operations)
 *
 * Note: This requires DNS lookup which adds latency.
 * Only use for critical operations where verification is essential.
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot
 */
export async function verifyGooglebot(request: Request): Promise<boolean> {
	const userAgent = request.headers.get("User-Agent") || "";

	// First check if it claims to be Googlebot
	if (!userAgent.toLowerCase().includes("googlebot")) {
		return false;
	}

	// Get the client IP
	const clientIP =
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

	if (!clientIP) {
		return false;
	}

	// In Cloudflare Workers, we can't do reverse DNS directly
	// This would need to be done via an external service or Cloudflare's API
	// For now, return true if it claims to be Googlebot
	// In production, consider using a verification service
	console.warn("[SEO] Googlebot verification requires external DNS lookup");
	return true;
}
