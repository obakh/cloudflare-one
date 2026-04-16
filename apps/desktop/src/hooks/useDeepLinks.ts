import { useEffect } from "react";

/**
 * Hook to handle deep link events
 *
 * @example
 * ```tsx
 * useDeepLinks((url) => {
 *   console.log("Deep link:", url);
 *   // Navigate based on URL
 * });
 * ```
 */
export function useDeepLinks(onDeepLink: (url: string) => void) {
	useEffect(() => {
		let unlisten: (() => void) | undefined;

		async function setupDeepLinks() {
			try {
				const { onOpenUrl } = await import("@tauri-apps/plugin-deep-link");

				unlisten = await onOpenUrl((urls) => {
					for (const url of urls) {
						onDeepLink(url);
					}
				});
			} catch {
				// Not running in Tauri or plugin not available
			}
		}

		setupDeepLinks();

		return () => {
			unlisten?.();
		};
	}, [onDeepLink]);
}
