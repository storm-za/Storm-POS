#[cfg(desktop)]
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init());

    #[cfg(target_os = "android")]
    let builder = builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sharekit::init());

    builder
        .setup(|app| {
            #[cfg(desktop)]
            {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    check_for_updates(app_handle).await;
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Storm POS");
}

#[cfg(desktop)]
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
                    "Storm POS {} is available.\n\nClick Install Now to download and install automatically.",
                    version
                ))
                .title("Update Available")
                .buttons(MessageDialogButtons::OkCancelCustom(
                    "Install Now".into(),
                    "Later".into(),
                ))
                .blocking_show();

            if confirmed {
                if let Err(e) = update
                    .download_and_install(|_chunk, _total| {}, || {})
                    .await
                {
                    eprintln!("Update install failed: {}", e);
                    return;
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
