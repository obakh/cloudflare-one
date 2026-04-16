import { useEffect, useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { useDeepLinks } from "./hooks/useDeepLinks";
import { useNotifications } from "./hooks/useNotifications";
import { useUpdater } from "./hooks/useUpdater";

export default function App() {
	const [appInfo, setAppInfo] = useState<{ name: string; version: string } | null>(null);
	const { checkForUpdates, updateAvailable, updateInfo } = useUpdater();
	const { sendNotification } = useNotifications();

	// Listen for deep links
	useDeepLinks((url) => {
		console.log("Deep link received:", url);
		// Handle deep link navigation here
	});

	useEffect(() => {
		// Get app info from Tauri
		async function loadAppInfo() {
			try {
				const { getName, getVersion } = await import("@tauri-apps/api/app");
				const [name, version] = await Promise.all([getName(), getVersion()]);
				setAppInfo({ name, version });
			} catch {
				// Running in browser, not Tauri
				setAppInfo({ name: "Desktop App", version: "dev" });
			}
		}
		loadAppInfo();
	}, []);

	return (
		<>
			<Titlebar title={appInfo?.name ?? "Desktop App"} />
			<main className="main-content">
				<div className="card">
					<h2 className="card-title">Welcome to {appInfo?.name ?? "Desktop App"}</h2>
					<p className="card-description">
						This is a Tauri-based desktop application template with React. It includes system tray,
						global shortcuts, deep links, auto-updates, and more.
					</p>
					<div style={{ marginTop: 16, display: "flex", gap: 8 }}>
						<span className="status">
							<span className="status-dot online" />
							Version {appInfo?.version ?? "..."}
						</span>
					</div>
				</div>

				<div className="grid grid-2">
					<div className="card">
						<h3 className="card-title">Auto Updates</h3>
						<p className="card-description">
							{updateAvailable
								? `Update available: v${updateInfo?.version}`
								: "You're running the latest version."}
						</p>
						<button
							type="button"
							className="btn btn-secondary"
							style={{ marginTop: 12 }}
							onClick={checkForUpdates}
						>
							Check for Updates
						</button>
					</div>

					<div className="card">
						<h3 className="card-title">Notifications</h3>
						<p className="card-description">Send native system notifications from your app.</p>
						<button
							type="button"
							className="btn btn-secondary"
							style={{ marginTop: 12 }}
							onClick={() =>
								sendNotification({
									title: "Hello!",
									body: "This is a native notification from your desktop app.",
								})
							}
						>
							Send Test Notification
						</button>
					</div>

					<div className="card">
						<h3 className="card-title">Global Shortcuts</h3>
						<p className="card-description">
							Press{" "}
							<kbd style={{ background: "#262626", padding: "2px 6px", borderRadius: 4 }}>
								Ctrl/Cmd + Shift + K
							</kbd>{" "}
							to toggle the command palette (when implemented).
						</p>
					</div>

					<div className="card">
						<h3 className="card-title">Deep Links</h3>
						<p className="card-description">
							Open{" "}
							<code style={{ background: "#262626", padding: "2px 6px", borderRadius: 4 }}>
								myapp://path
							</code>{" "}
							URLs to navigate directly into the app.
						</p>
					</div>
				</div>

				<div className="card">
					<h3 className="card-title">Features</h3>
					<ul style={{ marginTop: 12, paddingLeft: 20, color: "var(--text-secondary)" }}>
						<li>Cross-platform (macOS, Windows, Linux)</li>
						<li>Custom titlebar with window controls</li>
						<li>System tray with menu</li>
						<li>Global keyboard shortcuts</li>
						<li>Deep link handling (custom URL scheme)</li>
						<li>Auto-updater with GitHub releases</li>
						<li>Native notifications</li>
						<li>Persistent storage (key-value store)</li>
						<li>Multi-environment configs (dev/staging/prod)</li>
					</ul>
				</div>
			</main>
		</>
	);
}
