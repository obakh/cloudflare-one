import { useCallback } from "react";

interface NotificationOptions {
	title: string;
	body?: string;
	icon?: string;
}

/**
 * Hook to send native notifications
 *
 * @example
 * ```tsx
 * const { sendNotification, requestPermission } = useNotifications();
 *
 * await sendNotification({
 *   title: "Hello!",
 *   body: "This is a notification",
 * });
 * ```
 */
export function useNotifications() {
	const requestPermission = useCallback(async () => {
		try {
			const { requestPermission, isPermissionGranted } = await import(
				"@tauri-apps/plugin-notification"
			);

			const granted = await isPermissionGranted();
			if (!granted) {
				const permission = await requestPermission();
				return permission === "granted";
			}
			return true;
		} catch {
			// Not running in Tauri, try web notifications
			if ("Notification" in window) {
				const permission = await Notification.requestPermission();
				return permission === "granted";
			}
			return false;
		}
	}, []);

	const sendNotification = useCallback(async (options: NotificationOptions) => {
		try {
			const { sendNotification: send, isPermissionGranted } = await import(
				"@tauri-apps/plugin-notification"
			);

			const granted = await isPermissionGranted();
			if (granted) {
				await send(options);
				return true;
			}
			return false;
		} catch {
			// Not running in Tauri, try web notifications
			if ("Notification" in window && Notification.permission === "granted") {
				new Notification(options.title, { body: options.body, icon: options.icon });
				return true;
			}
			return false;
		}
	}, []);

	return {
		sendNotification,
		requestPermission,
	};
}
