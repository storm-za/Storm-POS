use tauri::Manager;

#[cfg(desktop)]
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;

// Save a base64-encoded PDF to the app cache directory (for FileProvider sharing)
// and also attempt to write a copy to the public Downloads folder so the user
// can find it in the Files app. The Downloads write is best-effort: on Android 10+
// with scoped storage it may be silently skipped without affecting sharing.
#[tauri::command]
async fn save_pdf_to_device(data: String, filename: String, app: tauri::AppHandle) -> Result<String, String> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(&data)
        .map_err(|e| format!("base64 decode: {e}"))?;

    // Primary: write to app cache — always writable, used for FileProvider sharing.
    let cache_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&cache_dir).ok();
    let cache_path = cache_dir.join(&filename);
    std::fs::write(&cache_path, &bytes).map_err(|e| format!("cache write error: {e}"))?;

    // Secondary: try to write to public Downloads/StormPOS/ so it appears in Files.
    // Requires WRITE_EXTERNAL_STORAGE on Android < 10; silently ignored if blocked.
    let downloads_dir = std::path::PathBuf::from("/storage/emulated/0/Download/StormPOS");
    if std::fs::create_dir_all(&downloads_dir).is_ok() {
        let _ = std::fs::write(downloads_dir.join(&filename), &bytes);
    }

    Ok(cache_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_pdf_to_device]);

    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init());

    #[cfg(target_os = "android")]
    let builder = builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sharekit::init())
        .plugin(tauri_plugin_http::init());

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
