import { useCallback } from "react";

interface TitlebarProps {
	title?: string;
}

export function Titlebar({ title = "Desktop App" }: TitlebarProps) {
	const handleMinimize = useCallback(async () => {
		try {
			const { getCurrentWindow } = await import("@tauri-apps/api/window");
			await getCurrentWindow().minimize();
		} catch {
			// Not running in Tauri
		}
	}, []);

	const handleMaximize = useCallback(async () => {
		try {
			const { getCurrentWindow } = await import("@tauri-apps/api/window");
			const window = getCurrentWindow();
			const isMaximized = await window.isMaximized();
			if (isMaximized) {
				await window.unmaximize();
			} else {
				await window.maximize();
			}
		} catch {
			// Not running in Tauri
		}
	}, []);

	const handleClose = useCallback(async () => {
		try {
			const { getCurrentWindow } = await import("@tauri-apps/api/window");
			await getCurrentWindow().close();
		} catch {
			// Not running in Tauri
		}
	}, []);

	return (
		<div className="titlebar">
			{/* macOS-style controls on the left */}
			<div className="titlebar-controls">
				<button
					className="titlebar-btn close"
					onClick={handleClose}
					aria-label="Close window"
					type="button"
				/>
				<button
					className="titlebar-btn minimize"
					onClick={handleMinimize}
					aria-label="Minimize window"
					type="button"
				/>
				<button
					className="titlebar-btn maximize"
					onClick={handleMaximize}
					aria-label="Maximize window"
					type="button"
				/>
			</div>

			{/* Draggable title area */}
			<div className="titlebar-drag" data-tauri-drag-region>
				<span className="titlebar-title">{title}</span>
			</div>
		</div>
	);
}
