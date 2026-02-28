use tauri_plugin_dialog::DialogExt;
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_updates(app_handle).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Storm POS");
}

async fn check_for_updates(app: tauri::AppHandle) {
    match app.updater() {
        Ok(updater) => {
            match updater.check().await {
                Ok(Some(update)) => {
                    let version = update.version.clone();
                    let confirmed = app
                        .dialog()
                        .message(format!(
                            "Storm POS {} is available.\n\nWould you like to install it now?",
                            version
                        ))
                        .title("Update Available")
                        .ok_button_label("Install Now")
                        .cancel_button_label("Later")
                        .blocking_show();

                    if confirmed {
                        if let Err(e) = update.download_and_install(|_, _| {}, || {}).await {
                            eprintln!("Update install failed: {}", e);
                        }
                        app.restart();
                    }
                }
                Ok(None) => {}
                Err(e) => {
                    eprintln!("Update check failed: {}", e);
                }
            }
        }
        Err(e) => {
            eprintln!("Updater plugin error: {}", e);
        }
    }
}
