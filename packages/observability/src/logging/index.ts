/**
 * Structured Logging for Cloudflare Workers
 *
 * Lightweight logger that works with Workers' console (wrangler tail).
 * Outputs structured JSON in production, pretty format in development.
 *
 * @example Basic usage
 * ```ts
 * import { logger } from "@repo/observability/logging";
 *
 * logger.info("User signed in", { userId: "123" });
 * logger.error("Failed to process", { error: err.message });
 * ```
 *
 * @example With context
 * ```ts
 * import { createLogger } from "@repo/observability/logging";
 *
 * const log = createLogger("auth");
 * log.info("Token validated"); // [auth] Token validated
 * ```
 */

import { addBreadcrumb, captureException } from "../sentry/index.js";

// ============================================================================
// Types
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogData {
	[key: string]: unknown;
}

export interface LogEntry {
	level: LogLevel;
	message: string;
	context?: string;
	timestamp: string;
	data?: LogData;
}

export interface Logger {
	debug(message: string, data?: LogData): void;
	info(message: string, data?: LogData): void;
	warn(message: string, data?: LogData): void;
	error(message: string, data?: LogData): void;
	child(context: string): Logger;
}

export interface LoggerOptions {
	/** Minimum log level (default: "info", or "debug" if LOG_LEVEL=debug) */
	level?: LogLevel;
	/** Logger context/prefix */
	context?: string;
	/** Output format (default: auto-detect from environment) */
	format?: "json" | "pretty";
	/** Send errors to Sentry */
	sentryEnabled?: boolean;
}

// ============================================================================
// Log Level Utilities
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
	return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function getDefaultLevel(): LogLevel {
	if (typeof process !== "undefined" && process.env?.LOG_LEVEL) {
		const level = process.env.LOG_LEVEL.toLowerCase();
		if (level in LOG_LEVELS) return level as LogLevel;
	}
	return "info";
}

function isPrettyMode(): boolean {
	// Check for development indicators
	if (typeof process !== "undefined") {
		if (process.env?.LOG_PRETTY === "true") return true;
		if (process.env?.NODE_ENV === "development") return true;
	}
	return false;
}

// ============================================================================
// Formatters
// ============================================================================

function formatPretty(entry: LogEntry): string {
	const { level, message, context, data } = entry;
	const time = new Date().toLocaleTimeString("en-US", { hour12: false });

	const levelColors: Record<LogLevel, string> = {
		debug: "\x1b[90m", // gray
		info: "\x1b[36m", // cyan
		warn: "\x1b[33m", // yellow
		error: "\x1b[31m", // red
	};
	const reset = "\x1b[0m";
	const color = levelColors[level];

	const prefix = context ? `[${context}] ` : "";
	const dataStr = data && Object.keys(data).length > 0 ? ` ${JSON.stringify(data)}` : "";

	return `${color}${time} ${level.toUpperCase().padEnd(5)}${reset} ${prefix}${message}${dataStr}`;
}

function formatJson(entry: LogEntry): string {
	return JSON.stringify(entry);
}

// ============================================================================
// Logger Implementation
// ============================================================================

function createLoggerImpl(options: LoggerOptions = {}): Logger {
	const {
		level = getDefaultLevel(),
		context,
		format = isPrettyMode() ? "pretty" : "json",
		sentryEnabled = true,
	} = options;

	const log = (logLevel: LogLevel, message: string, data?: LogData): void => {
		if (!shouldLog(logLevel, level)) return;

		const entry: LogEntry = {
			level: logLevel,
			message,
			timestamp: new Date().toISOString(),
			...(context && { context }),
			...(data && Object.keys(data).length > 0 && { data }),
		};

		const output = format === "pretty" ? formatPretty(entry) : formatJson(entry);

		// Use appropriate console method
		switch (logLevel) {
			case "debug":
				console.debug(output);
				break;
			case "info":
				console.info(output);
				break;
			case "warn":
				console.warn(output);
				break;
			case "error":
				console.error(output);
				// Send to Sentry
				if (sentryEnabled) {
					addBreadcrumb({
						category: context || "log",
						message,
						level: "error",
						data,
					});
					if (data?.error) {
						captureException(data.error, { ...data, context });
					}
				}
				break;
		}
	};

	return {
		debug: (message, data) => log("debug", message, data),
		info: (message, data) => log("info", message, data),
		warn: (message, data) => log("warn", message, data),
		error: (message, data) => log("error", message, data),
		child: (childContext) =>
			createLoggerImpl({
				...options,
				context: context ? `${context}:${childContext}` : childContext,
			}),
	};
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Create a logger with options
 *
 * @example
 * ```ts
 * const log = createLogger("api");
 * log.info("Request received", { path: "/users" });
 *
 * const authLog = log.child("auth");
 * authLog.info("Token validated"); // [api:auth] Token validated
 * ```
 */
export function createLogger(contextOrOptions?: string | LoggerOptions): Logger {
	if (typeof contextOrOptions === "string") {
		return createLoggerImpl({ context: contextOrOptions });
	}
	return createLoggerImpl(contextOrOptions);
}

/**
 * Default logger instance
 */
export const logger = createLoggerImpl();

/**
 * Log with request context (adds request ID, path, method)
 */
export function withRequestContext(request: Request, baseLogger: Logger = logger): Logger {
	const requestId =
		request.headers.get("cf-ray") ||
		request.headers.get("x-request-id") ||
		crypto.randomUUID().slice(0, 8);

	const _url = new URL(request.url);

	return createLoggerImpl({
		context: baseLogger === logger ? undefined : (baseLogger as any).context,
		level: getDefaultLevel(),
	}).child(`req:${requestId}`);
}

/**
 * Measure and log execution time
 *
 * @example
 * ```ts
 * const result = await logTiming(logger, "database query", async () => {
 *   return await db.query("SELECT * FROM users");
 * });
 * ```
 */
export async function logTiming<T>(
	log: Logger,
	operation: string,
	fn: () => Promise<T>,
): Promise<T> {
	const start = Date.now();
	try {
		const result = await fn();
		const duration = Date.now() - start;
		log.info(`${operation} completed`, { durationMs: duration });
		return result;
	} catch (error) {
		const duration = Date.now() - start;
		log.error(`${operation} failed`, {
			durationMs: duration,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
