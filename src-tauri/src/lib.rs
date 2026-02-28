use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
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
    let updater = match app.updater() {
        Ok(u) => u,
        Err(e) => {
            eprintln!("Updater plugin error: {}", e);
            return;
        }
    };

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
                .buttons(MessageDialogButtons::OkCancelCustom(
                    "Install Now".into(),
                    "Later".into(),
                ))
                .blocking_show();

            if confirmed {
                if let Err(e) = update.download_and_install(|_, _| {}, || {}).await {
                    eprintln!("Update install failed: {}", e);
                } else {
                    app.restart();
                }
            }
        }
        Ok(None) => {}
        Err(e) => {
            eprintln!("Update check failed: {}", e);
        }
    }
}
