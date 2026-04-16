import { useCallback, useEffect, useState } from "react";

/**
 * Hook for persistent key-value storage
 *
 * @example
 * ```tsx
 * const { value, setValue, loading } = useStore<string>("user-preference", "default");
 *
 * // Update value
 * await setValue("new-value");
 * ```
 */
export function useStore<T>(key: string, defaultValue: T) {
	const [value, setValueState] = useState<T>(defaultValue);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadValue() {
			try {
				const { LazyStore } = await import("@tauri-apps/plugin-store");
				const store = new LazyStore("app-store.json");
				const stored = await store.get<T>(key);
				if (stored !== null && stored !== undefined) {
					setValueState(stored);
				}
			} catch {
				// Not running in Tauri, use localStorage
				const stored = localStorage.getItem(key);
				if (stored) {
					try {
						setValueState(JSON.parse(stored));
					} catch {
						// Invalid JSON, use default
					}
				}
			} finally {
				setLoading(false);
			}
		}
		loadValue();
	}, [key]);

	const setValue = useCallback(
		async (newValue: T) => {
			setValueState(newValue);
			try {
				const { LazyStore } = await import("@tauri-apps/plugin-store");
				const store = new LazyStore("app-store.json");
				await store.set(key, newValue);
				await store.save();
			} catch {
				// Not running in Tauri, use localStorage
				localStorage.setItem(key, JSON.stringify(newValue));
			}
		},
		[key],
	);

	const removeValue = useCallback(async () => {
		setValueState(defaultValue);
		try {
			const { LazyStore } = await import("@tauri-apps/plugin-store");
			const store = new LazyStore("app-store.json");
			await store.delete(key);
			await store.save();
		} catch {
			// Not running in Tauri, use localStorage
			localStorage.removeItem(key);
		}
	}, [key, defaultValue]);

	return {
		value,
		setValue,
		removeValue,
		loading,
	};
}
