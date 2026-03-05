use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use tauri_plugin_shell::ShellExt;
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
            let download_url = update.download_url.clone().map(|u| u.to_string()).unwrap_or_else(|| {
                "https://github.com/storm-za/Storm-POS/releases/latest".to_string()
            });

            let confirmed = app
                .dialog()
                .message(format!(
                    "Storm POS {} is available.\n\nClick Install Now to download the new installer.",
                    version
                ))
                .title("Update Available")
                .buttons(MessageDialogButtons::OkCancelCustom(
                    "Install Now".into(),
                    "Later".into(),
                ))
                .blocking_show();

            if confirmed {
                if let Err(e) = app.shell().open(&download_url, None) {
                    eprintln!("Failed to open browser: {}", e);
                }
            }
        }
        Ok(None) => {}
        Err(e) => {
            eprintln!("Update check failed: {}", e);
        }
    }
}
