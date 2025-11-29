use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Manager, Emitter,
};
use tauri_plugin_notification::NotificationExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn send_native_notification(app: tauri::AppHandle, title: String, body: String) {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .unwrap();
}

fn navigate_to_main(app: tauri::AppHandle) {
    dbg!("Navigate to main");
    app.emit("navigate_to_main", ()).unwrap();
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
            
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        dbg!("Quit menu item was clicked");
                        app.exit(0);
                    },
                    "hide" => {
                        dbg!("Hide menu item was clicked");
                        let window = app.get_webview_window("main").unwrap();
                        window.hide().unwrap();
                    },
                    "open" => {
                        dbg!("Open menu item was clicked");
                        let window = app.get_webview_window("main").unwrap();
                        window.show().unwrap();
                    },
                    _ => {
                        println!("Menu item {:?} not handled", event.id);
                    }
                })
                .build(app)?;
            Ok(())
        })
        .plugin(tauri_plugin_svelte::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, send_native_notification])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                navigate_to_main(window.app_handle().clone());
                window.hide().unwrap();
                send_native_notification(
                    window.app_handle().clone(),
                    "Praydo Running in the Background".to_string(),
                    "Click the tray icon to restore.".to_string()
                );
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
