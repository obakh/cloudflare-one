/**
 * @repo/embed
 *
 * Embeddable components, script loaders, and postMessage communication helpers.
 *
 * @example Iframe embedding
 * ```tsx
 * import { EmbedIframe, useIframe, SANDBOX_PERMISSIONS } from "@repo/embed/iframe";
 *
 * // Simple embed
 * <EmbedIframe
 *   src="https://example.com/widget"
 *   width="100%"
 *   height={400}
 *   onMessage={(data) => console.log("Message:", data)}
 * />
 *
 * // With hook for more control
 * const { ref, postMessage, isLoaded } = useIframe({
 *   onMessage: (data) => console.log(data),
 *   targetOrigin: "https://example.com",
 * });
 *
 * <iframe ref={ref} src="https://example.com/widget" />
 * {isLoaded && <button onClick={() => postMessage({ action: "refresh" })}>Refresh</button>}
 * ```
 *
 * @example Script loading
 * ```tsx
 * import { useScript, useScripts, WIDGET_SCRIPTS } from "@repo/embed/script";
 *
 * // Load single script
 * const { status, error } = useScript({
 *   src: "https://example.com/widget.js",
 *   onLoad: () => console.log("Loaded!"),
 * });
 *
 * // Load multiple scripts
 * const { status } = useScripts({
 *   scripts: [
 *     WIDGET_SCRIPTS.stripe(),
 *     WIDGET_SCRIPTS.intercom("app-id"),
 *   ],
 * });
 *
 * // Preset widgets
 * useScript(WIDGET_SCRIPTS.crisp("website-id"));
 * useScript(WIDGET_SCRIPTS.plausible("example.com"));
 * ```
 *
 * @example PostMessage communication
 * ```tsx
 * import { createMessageChannel, createParentChannel } from "@repo/embed/messaging";
 *
 * // In parent window
 * const channel = createMessageChannel(iframe.contentWindow, {
 *   allowedOrigins: ["https://widget.example.com"],
 *   typePrefix: "myapp",
 * });
 *
 * channel.send("init", { userId: "123" });
 * channel.subscribe("ready", (payload) => console.log("Widget ready:", payload));
 *
 * // Request/response pattern
 * const data = await channel.request("getData", { id: "123" });
 *
 * // In iframe
 * const parentChannel = createParentChannel({ typePrefix: "myapp" });
 * parentChannel.onRequest("getData", async (payload) => {
 *   return await fetchData(payload.id);
 * });
 * ```
 */

// Iframe
export {
	ALLOW_PERMISSIONS,
	buildAllow,
	buildSandbox,
	EmbedIframe,
	type EmbedIframeProps,
	getOriginFromUrl,
	type IframeConfig,
	notifyParentOfResize,
	SANDBOX_PERMISSIONS,
	setupAutoResize,
	type UseIframeOptions,
	type UseIframeReturn,
	useIframe,
} from "./iframe";
// Messaging
export {
	type BroadcastChannelWrapper,
	createBroadcastChannel,
	createChildChannel,
	createMessageChannel,
	createParentChannel,
	defineMessages,
	type MessageChannel,
	type MessageChannelConfig,
	type MessageHandler,
	type PostMessageOptions,
	type RequestOptions,
	type TypedMessage,
} from "./messaging";
// Script loader
export {
	clearScriptCache,
	loadScriptAsync,
	type ScriptConfig,
	type ScriptStatus,
	type UseScriptOptions,
	type UseScriptReturn,
	type UseScriptsOptions,
	type UseScriptsReturn,
	useScript,
	useScripts,
	WIDGET_SCRIPTS,
} from "./script";
