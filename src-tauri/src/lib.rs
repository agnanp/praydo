use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Manager,
};
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
fn send_native_notification(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::new()
            .app_name("Praydo")
            .build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let open_i = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
            let separator_i = PredefinedMenuItem::separator(app)?;

            let menu = Menu::with_items(app, &[&open_i, &hide_i, &separator_i, &quit_i])?;
            
            let tray_builder = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        dbg!("Quit menu item was clicked");
                        app.exit(0);
                    },
                    "hide" => {
                        dbg!("Hide menu item was clicked");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    },
                    "open" => {
                        dbg!("Open menu item was clicked");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                        }
                    },
                    _ => {
                        println!("Menu item {:?} not handled", event.id);
                    }
                });

            let tray_builder = if let Some(icon) = app.default_window_icon() {
                tray_builder.icon(icon.clone())
            } else {
                tray_builder
            };

            let _ = tray_builder.build(app);
            Ok(())
        })
        .plugin(tauri_plugin_svelte::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_native_notification])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
                let _ = send_native_notification(
                    window.app_handle().clone(),
                    "Praydo Running in the Background".to_string(),
                    "Click the tray icon to restore.".to_string(),
                );
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
