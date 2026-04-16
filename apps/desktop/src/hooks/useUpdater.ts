import { useCallback, useState } from "react";

interface UpdateInfo {
	version: string;
	date?: string;
	body?: string;
}

/**
 * Hook to handle auto-updates
 *
 * @example
 * ```tsx
 * const { checkForUpdates, updateAvailable, updateInfo, installUpdate } = useUpdater();
 *
 * if (updateAvailable) {
 *   console.log("New version:", updateInfo?.version);
 *   await installUpdate();
 * }
 * ```
 */
export function useUpdater() {
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
	const [checking, setChecking] = useState(false);

	const checkForUpdates = useCallback(async () => {
		setChecking(true);
		try {
			const { check } = await import("@tauri-apps/plugin-updater");
			const update = await check();

			if (update) {
				setUpdateAvailable(true);
				setUpdateInfo({
					version: update.version,
					date: update.date,
					body: update.body,
				});
				return update;
			}
			setUpdateAvailable(false);
			setUpdateInfo(null);
			return null;
		} catch (error) {
			console.error("Failed to check for updates:", error);
			return null;
		} finally {
			setChecking(false);
		}
	}, []);

	const installUpdate = useCallback(async () => {
		try {
			const { check } = await import("@tauri-apps/plugin-updater");
			const update = await check();

			if (update) {
				await update.downloadAndInstall((progress) => {
					console.log("Download progress:", progress);
				});

				// Restart the app after update
				const { relaunch } = await import("@tauri-apps/plugin-process");
				await relaunch();
			}
		} catch (error) {
			console.error("Failed to install update:", error);
		}
	}, []);

	return {
		checkForUpdates,
		installUpdate,
		updateAvailable,
		updateInfo,
		checking,
	};
}
