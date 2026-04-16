"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface ScriptConfig {
	/** Script source URL */
	src: string;
	/** Load script asynchronously */
	async?: boolean;
	/** Defer script execution */
	defer?: boolean;
	/** Script type (default: text/javascript) */
	type?: string;
	/** Crossorigin attribute */
	crossOrigin?: "anonymous" | "use-credentials";
	/** Integrity hash for SRI */
	integrity?: string;
	/** Nonce for CSP */
	nonce?: string;
	/** Custom attributes */
	attributes?: Record<string, string>;
	/** Called when script loads */
	onLoad?: () => void;
	/** Called on error */
	onError?: (error: Error) => void;
}

export interface UseScriptOptions extends ScriptConfig {
	/** Whether to load the script immediately */
	enabled?: boolean;
	/** Remove script on unmount */
	removeOnUnmount?: boolean;
}

export type ScriptStatus = "idle" | "loading" | "ready" | "error";

export interface UseScriptReturn {
	/** Current loading status */
	status: ScriptStatus;
	/** Error if loading failed */
	error: Error | null;
	/** Manually load the script */
	load: () => void;
	/** Remove the script */
	remove: () => void;
}

// ============================================================================
// Script cache (prevent duplicate loads)
// ============================================================================

const scriptCache = new Map<string, Promise<void>>();
const loadedScripts = new Set<string>();

// ============================================================================
// Hook: useScript
// ============================================================================

export function useScript(options: UseScriptOptions): UseScriptReturn {
	const {
		src,
		async = true,
		defer = false,
		type = "text/javascript",
		crossOrigin,
		integrity,
		nonce,
		attributes = {},
		onLoad,
		onError,
		enabled = true,
		removeOnUnmount = false,
	} = options;

	const [status, setStatus] = useState<ScriptStatus>(() =>
		loadedScripts.has(src) ? "ready" : "idle",
	);
	const [error, setError] = useState<Error | null>(null);
	const scriptRef = useRef<HTMLScriptElement | null>(null);

	const load = useCallback(() => {
		// Already loaded
		if (loadedScripts.has(src)) {
			setStatus("ready");
			onLoad?.();
			return;
		}

		// Check cache for in-progress load
		const cached = scriptCache.get(src);
		if (cached) {
			cached
				.then(() => {
					setStatus("ready");
					onLoad?.();
				})
				.catch((err) => {
					setStatus("error");
					setError(err);
					onError?.(err);
				});
			return;
		}

		setStatus("loading");
		setError(null);

		// Create script element
		const script = document.createElement("script");
		script.src = src;
		script.async = async;
		script.defer = defer;
		script.type = type;

		if (crossOrigin) script.crossOrigin = crossOrigin;
		if (integrity) script.integrity = integrity;
		if (nonce) script.nonce = nonce;

		// Apply custom attributes
		Object.entries(attributes).forEach(([key, value]) => {
			script.setAttribute(key, value);
		});

		scriptRef.current = script;

		// Create promise for caching
		const loadPromise = new Promise<void>((resolve, reject) => {
			script.onload = () => {
				loadedScripts.add(src);
				setStatus("ready");
				onLoad?.();
				resolve();
			};

			script.onerror = () => {
				const err = new Error(`Failed to load script: ${src}`);
				scriptCache.delete(src);
				setStatus("error");
				setError(err);
				onError?.(err);
				reject(err);
			};
		});

		scriptCache.set(src, loadPromise);
		document.body.appendChild(script);
	}, [src, async, defer, type, crossOrigin, integrity, nonce, attributes, onLoad, onError]);

	const remove = useCallback(() => {
		if (scriptRef.current) {
			scriptRef.current.remove();
			scriptRef.current = null;
		}
		scriptCache.delete(src);
		loadedScripts.delete(src);
		setStatus("idle");
		setError(null);
	}, [src]);

	// Auto-load if enabled
	useEffect(() => {
		if (enabled && status === "idle") {
			load();
		}
	}, [enabled, status, load]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (removeOnUnmount) {
				remove();
			}
		};
	}, [removeOnUnmount, remove]);

	return { status, error, load, remove };
}

// ============================================================================
// Hook: useScripts (load multiple scripts)
// ============================================================================

export interface UseScriptsOptions {
	/** Scripts to load */
	scripts: ScriptConfig[];
	/** Load scripts in sequence (default: parallel) */
	sequential?: boolean;
	/** Whether to load scripts immediately */
	enabled?: boolean;
}

export interface UseScriptsReturn {
	/** Overall status */
	status: ScriptStatus;
	/** Individual script statuses */
	statuses: Map<string, ScriptStatus>;
	/** Errors by script src */
	errors: Map<string, Error>;
	/** Load all scripts */
	loadAll: () => Promise<void>;
}

export function useScripts(options: UseScriptsOptions): UseScriptsReturn {
	const { scripts, sequential = false, enabled = true } = options;

	const [statuses, setStatuses] = useState<Map<string, ScriptStatus>>(
		() => new Map(scripts.map((s) => [s.src, loadedScripts.has(s.src) ? "ready" : "idle"])),
	);
	const [errors, setErrors] = useState<Map<string, Error>>(() => new Map());

	const loadAll = useCallback(async () => {
		const loadScript = async (config: ScriptConfig) => {
			const { src } = config;

			if (loadedScripts.has(src)) {
				setStatuses((prev) => new Map(prev).set(src, "ready"));
				return;
			}

			setStatuses((prev) => new Map(prev).set(src, "loading"));

			try {
				await loadScriptAsync(config);
				setStatuses((prev) => new Map(prev).set(src, "ready"));
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setStatuses((prev) => new Map(prev).set(src, "error"));
				setErrors((prev) => new Map(prev).set(src, error));
				throw error;
			}
		};

		if (sequential) {
			for (const script of scripts) {
				await loadScript(script);
			}
		} else {
			await Promise.all(scripts.map(loadScript));
		}
	}, [scripts, sequential]);

	// Auto-load if enabled
	useEffect(() => {
		if (enabled) {
			loadAll().catch(() => {
				// Errors are tracked in state
			});
		}
	}, [enabled, loadAll]);

	// Compute overall status
	const statusValues = Array.from(statuses.values());
	let status: ScriptStatus = "ready";
	if (statusValues.some((s) => s === "error")) status = "error";
	else if (statusValues.some((s) => s === "loading")) status = "loading";
	else if (statusValues.some((s) => s === "idle")) status = "idle";

	return { status, statuses, errors, loadAll };
}

// ============================================================================
// Utility: loadScriptAsync
// ============================================================================

export function loadScriptAsync(config: ScriptConfig): Promise<void> {
	const { src } = config;

	// Already loaded
	if (loadedScripts.has(src)) {
		return Promise.resolve();
	}

	// Check cache
	const cached = scriptCache.get(src);
	if (cached) return cached;

	const promise = new Promise<void>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.async = config.async ?? true;
		script.defer = config.defer ?? false;
		script.type = config.type ?? "text/javascript";

		if (config.crossOrigin) script.crossOrigin = config.crossOrigin;
		if (config.integrity) script.integrity = config.integrity;
		if (config.nonce) script.nonce = config.nonce;

		if (config.attributes) {
			Object.entries(config.attributes).forEach(([key, value]) => {
				script.setAttribute(key, value);
			});
		}

		script.onload = () => {
			loadedScripts.add(src);
			config.onLoad?.();
			resolve();
		};

		script.onerror = () => {
			const err = new Error(`Failed to load script: ${src}`);
			scriptCache.delete(src);
			config.onError?.(err);
			reject(err);
		};

		document.body.appendChild(script);
	});

	scriptCache.set(src, promise);
	return promise;
}

// ============================================================================
// Presets for common third-party widgets
// ============================================================================

export const WIDGET_SCRIPTS = {
	/** Intercom messenger */
	intercom: (appId: string): ScriptConfig => ({
		src: `https://widget.intercom.io/widget/${appId}`,
		async: true,
		attributes: { "data-app-id": appId },
	}),

	/** Crisp chat */
	crisp: (websiteId: string): ScriptConfig => ({
		src: "https://client.crisp.chat/l.js",
		async: true,
		attributes: { "data-website-id": websiteId },
	}),

	/** Stripe.js */
	stripe: (): ScriptConfig => ({
		src: "https://js.stripe.com/v3/",
		async: true,
	}),

	/** Google Analytics (gtag) */
	gtag: (measurementId: string): ScriptConfig => ({
		src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
		async: true,
	}),

	/** Plausible Analytics */
	plausible: (domain: string): ScriptConfig => ({
		src: "https://plausible.io/js/script.js",
		defer: true,
		attributes: { "data-domain": domain },
	}),

	/** Fathom Analytics */
	fathom: (siteId: string): ScriptConfig => ({
		src: "https://cdn.usefathom.com/script.js",
		defer: true,
		attributes: { "data-site": siteId },
	}),

	/** Hotjar */
	hotjar: (hjid: string): ScriptConfig => ({
		src: `https://static.hotjar.com/c/hotjar-${hjid}.js?sv=6`,
		async: true,
	}),

	/** Segment Analytics */
	segment: (writeKey: string): ScriptConfig => ({
		src: `https://cdn.segment.com/analytics.js/v1/${writeKey}/analytics.min.js`,
		async: true,
	}),

	/** Sentry Browser SDK */
	sentry: (dsn: string): ScriptConfig => ({
		src: "https://browser.sentry-cdn.com/7.0.0/bundle.min.js",
		crossOrigin: "anonymous",
		integrity: undefined, // Add actual integrity hash in production
		attributes: { "data-dsn": dsn },
	}),
} as const;

// ============================================================================
// Clear cache (useful for testing)
// ============================================================================

export function clearScriptCache() {
	scriptCache.clear();
	loadedScripts.clear();
}
