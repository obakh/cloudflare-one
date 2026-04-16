use std::env;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_deep_link::DeepLinkExt;

// ============================================================================
// Commands
// ============================================================================

/// Show and focus the main window
#[tauri::command]
fn show_window(window: tauri::Window) -> Result<(), String> {
    let app_handle = window.app_handle();
    let main_window = app_handle
        .get_webview_window("main")
        .ok_or("Main window not found")?;

    main_window
        .show()
        .map_err(|e| format!("Failed to show window: {}", e))?;
    main_window
        .set_focus()
        .map_err(|e| format!("Failed to set focus: {}", e))?;

    Ok(())
}

/// Hide the main window (minimize to tray)
#[tauri::command]
fn hide_window(window: tauri::Window) -> Result<(), String> {
    let app_handle = window.app_handle();
    let main_window = app_handle
        .get_webview_window("main")
        .ok_or("Main window not found")?;

    main_window
        .hide()
        .map_err(|e| format!("Failed to hide window: {}", e))?;

    Ok(())
}

/// Check for updates and show dialog
#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<bool, String> {
    #[cfg(desktop)]
    {
        use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
        use tauri_plugin_updater::UpdaterExt;

        if let Ok(updater) = app.updater() {
            match updater.check().await {
                Ok(Some(update)) => {
                    let answer = app
                        .dialog()
                        .message(format!(
                            "Version {} is available. Would you like to update now?",
                            update.version
                        ))
                        .title("Update Available")
                        .kind(MessageDialogKind::Info)
                        .buttons(MessageDialogButtons::OkCancel)
                        .blocking_show();

                    if answer {
                        let _ = update
                            .download_and_install(|_, _| {}, || {
                                println!("Update download finished");
                            })
                            .await;
                    }
                    return Ok(true);
                }
                Ok(None) => {
                    let version = app.package_info().version.to_string();
                    app.dialog()
                        .message(format!("You're running version {}. No updates available.", version))
                        .title("Up to Date")
                        .kind(MessageDialogKind::Info)
                        .buttons(MessageDialogButtons::Ok)
                        .blocking_show();
                    return Ok(false);
                }
                Err(e) => {
                    app.dialog()
                        .message(format!("Failed to check for updates: {}", e))
                        .title("Update Error")
                        .kind(MessageDialogKind::Error)
                        .buttons(MessageDialogButtons::Ok)
                        .blocking_show();
                    return Err(e.to_string());
                }
            }
        }
    }

    Ok(false)
}

// ============================================================================
// Helpers
// ============================================================================

/// Get the app URL based on environment
fn get_app_url() -> String {
    let env = env::var("APP_ENV").unwrap_or_else(|_| "development".to_string());

    match env.as_str() {
        "production" | "prod" => "https://app.example.com".to_string(),
        "staging" => "https://staging.example.com".to_string(),
        _ => "http://localhost:1420".to_string(),
    }
}

/// Handle deep link events
fn handle_deep_link(app_handle: &tauri::AppHandle, urls: Vec<String>) {
    for url in &urls {
        // Extract path from deep link (e.g., myapp://path/to/page)
        if let Some(path) = url.strip_prefix("myapp://") {
            let clean_path = path.trim_start_matches('/');

            if let Some(window) = app_handle.get_webview_window("main") {
                // Emit navigation event to frontend
                let _ = window.emit("deep-link-navigate", clean_path);
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    }
}

// ============================================================================
// App Entry
// ============================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _app_url = get_app_url();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            show_window,
            hide_window,
            check_for_updates
        ])
        .setup(move |app| {
            // Initialize updater plugin (desktop only)
            #[cfg(desktop)]
            {
                let _ = app.handle().plugin(tauri_plugin_updater::Builder::new().build());
            }

            let app_handle = app.handle().clone();

            // Register deep links in development
            #[cfg(debug_assertions)]
            {
                let _ = app_handle.deep_link().register_all();
            }

            // Handle deep link events
            let app_handle_for_deep_links = app_handle.clone();
            app_handle.deep_link().on_open_url(move |event| {
                let url_strings: Vec<String> =
                    event.urls().iter().map(|url| url.to_string()).collect();
                handle_deep_link(&app_handle_for_deep_links, url_strings);
            });

            // Setup global shortcuts (desktop only)
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
                };

                // Ctrl/Cmd + Shift + K for command palette
                let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyK);

                if let Ok(_) = app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app_handle, s, event| {
                            if s == &shortcut && event.state() == ShortcutState::Pressed {
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.emit("global-shortcut", "command-palette");
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        })
                        .build(),
                ) {
                    let _ = app.global_shortcut().register(shortcut);
                }
            }

            // Setup system tray
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_item = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let check_updates_item =
                MenuItem::with_id(app, "check_updates", "Check for Updates...", true, None::<&str>)?;

            let tray_menu = Menu::with_items(app, &[&show_item, &check_updates_item, &quit_item])?;

            let _app_handle_for_tray = app_handle.clone();
            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "check_updates" => {
                        let app_handle = app.clone();
                        tauri::async_runtime::spawn(async move {
                            let _ = check_for_updates(app_handle).await;
                        });
                    }
                    _ => {}
                })
                .on_tray_icon_event(move |tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app_handle = tray.app_handle();
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri app")
        .run(|app_handle, event| match event {
            // Keep app running in background when window is closed
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            _ => {}
        });
}
