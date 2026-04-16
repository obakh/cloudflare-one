"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MessageHandler, PostMessageOptions } from "../messaging";

// ============================================================================
// Types
// ============================================================================

export interface IframeConfig {
	/** Source URL for the iframe */
	src: string;
	/** Iframe title for accessibility */
	title?: string;
	/** Width (CSS value or number for pixels) */
	width?: string | number;
	/** Height (CSS value or number for pixels) */
	height?: string | number;
	/** Allow fullscreen */
	allowFullscreen?: boolean;
	/** Sandbox attributes */
	sandbox?: string[];
	/** Allow attributes (camera, microphone, etc.) */
	allow?: string[];
	/** Loading strategy */
	loading?: "eager" | "lazy";
	/** Referrer policy */
	referrerPolicy?: ReferrerPolicy;
	/** Custom styles */
	style?: React.CSSProperties;
	/** Custom class name */
	className?: string;
	/** Called when iframe loads */
	onLoad?: () => void;
	/** Called on error */
	onError?: (error: Error) => void;
}

export interface EmbedIframeProps extends IframeConfig {
	/** Message handlers for postMessage communication */
	onMessage?: MessageHandler;
	/** Target origin for postMessage (defaults to iframe origin) */
	targetOrigin?: string;
}

export interface UseIframeOptions {
	/** Auto-resize iframe based on content */
	autoResize?: boolean;
	/** Message handlers */
	onMessage?: MessageHandler;
	/** Target origin for postMessage */
	targetOrigin?: string;
}

export interface UseIframeReturn {
	/** Ref to attach to iframe */
	ref: React.RefObject<HTMLIFrameElement | null>;
	/** Send message to iframe */
	postMessage: (message: unknown, options?: PostMessageOptions) => void;
	/** Whether iframe is loaded */
	isLoaded: boolean;
	/** Current iframe dimensions (if auto-resize enabled) */
	dimensions: { width: number; height: number } | null;
}

// ============================================================================
// Default sandbox permissions (secure defaults)
// ============================================================================

export const SANDBOX_PERMISSIONS = {
	SCRIPTS: "allow-scripts",
	SAME_ORIGIN: "allow-same-origin",
	FORMS: "allow-forms",
	POPUPS: "allow-popups",
	POPUPS_TO_ESCAPE: "allow-popups-to-escape-sandbox",
	TOP_NAVIGATION: "allow-top-navigation",
	TOP_NAVIGATION_USER: "allow-top-navigation-by-user-activation",
	MODALS: "allow-modals",
	DOWNLOADS: "allow-downloads",
	POINTER_LOCK: "allow-pointer-lock",
	ORIENTATION_LOCK: "allow-orientation-lock",
	PRESENTATION: "allow-presentation",
} as const;

export const ALLOW_PERMISSIONS = {
	CAMERA: "camera",
	MICROPHONE: "microphone",
	GEOLOCATION: "geolocation",
	FULLSCREEN: "fullscreen",
	PAYMENT: "payment",
	AUTOPLAY: "autoplay",
	CLIPBOARD_READ: "clipboard-read",
	CLIPBOARD_WRITE: "clipboard-write",
	ENCRYPTED_MEDIA: "encrypted-media",
	PICTURE_IN_PICTURE: "picture-in-picture",
	SCREEN_WAKE_LOCK: "screen-wake-lock",
} as const;

// ============================================================================
// Hook: useIframe
// ============================================================================

export function useIframe(options: UseIframeOptions = {}): UseIframeReturn {
	const { autoResize = false, onMessage, targetOrigin = "*" } = options;
	const ref = useRef<HTMLIFrameElement | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

	useEffect(() => {
		if (!onMessage && !autoResize) return;

		const handler = (event: MessageEvent) => {
			if (targetOrigin !== "*" && event.origin !== targetOrigin) return;
			if (ref.current && event.source !== ref.current.contentWindow) return;

			if (autoResize && event.data?.type === "__embed_resize__") {
				setDimensions({ width: event.data.width, height: event.data.height });
				return;
			}

			onMessage?.(event.data, event);
		};

		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [onMessage, targetOrigin, autoResize]);

	const postMessage = useCallback(
		(message: unknown, opts?: PostMessageOptions) => {
			if (!ref.current?.contentWindow) return;
			ref.current.contentWindow.postMessage(message, opts?.targetOrigin ?? targetOrigin);
		},
		[targetOrigin],
	);

	useEffect(() => {
		const iframe = ref.current;
		if (!iframe) return;
		const handleLoad = () => setIsLoaded(true);
		iframe.addEventListener("load", handleLoad);
		return () => iframe.removeEventListener("load", handleLoad);
	}, []);

	return { ref, postMessage, isLoaded, dimensions };
}

// ============================================================================
// Component: EmbedIframe
// ============================================================================

export function EmbedIframe({
	src,
	title = "Embedded content",
	width = "100%",
	height = 400,
	allowFullscreen = false,
	sandbox = [SANDBOX_PERMISSIONS.SCRIPTS, SANDBOX_PERMISSIONS.SAME_ORIGIN],
	allow = [],
	loading = "lazy",
	referrerPolicy = "strict-origin-when-cross-origin",
	style,
	className,
	onLoad,
	onError,
	onMessage,
	targetOrigin,
}: EmbedIframeProps) {
	const { ref, isLoaded } = useIframe({ onMessage, targetOrigin });

	return (
		<iframe
			ref={ref}
			src={src}
			title={title}
			width={typeof width === "number" ? width : undefined}
			height={typeof height === "number" ? height : undefined}
			allowFullScreen={allowFullscreen}
			sandbox={sandbox.join(" ")}
			allow={allow.join("; ")}
			loading={loading}
			referrerPolicy={referrerPolicy}
			onLoad={onLoad}
			onError={() => onError?.(new Error(`Failed to load iframe: ${src}`))}
			className={className}
			style={{
				border: "none",
				width: typeof width === "string" ? width : undefined,
				height: typeof height === "string" ? height : undefined,
				...style,
			}}
			data-loaded={isLoaded}
		/>
	);
}

// ============================================================================
// Utilities
// ============================================================================

export function buildSandbox(...permissions: string[]): string {
	return permissions.join(" ");
}

export function buildAllow(...permissions: string[]): string {
	return permissions.join("; ");
}

export function getOriginFromUrl(url: string): string {
	try {
		return new URL(url).origin;
	} catch {
		return "*";
	}
}

// ============================================================================
// Resize helpers (for use inside embedded content)
// ============================================================================

export function notifyParentOfResize(width: number, height: number, targetOrigin = "*") {
	if (typeof window === "undefined") return;
	window.parent.postMessage({ type: "__embed_resize__", width, height }, targetOrigin);
}

export function setupAutoResize(targetOrigin = "*") {
	if (typeof window === "undefined" || typeof document === "undefined") return;

	const report = () => {
		const { scrollWidth, scrollHeight } = document.documentElement;
		notifyParentOfResize(scrollWidth, scrollHeight, targetOrigin);
	};

	report();

	const observer = new ResizeObserver(report);
	observer.observe(document.body);

	const mutationObserver = new MutationObserver(report);
	mutationObserver.observe(document.body, { childList: true, subtree: true });

	return () => {
		observer.disconnect();
		mutationObserver.disconnect();
	};
}
