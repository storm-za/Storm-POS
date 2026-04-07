use tauri::Manager;

#[cfg(desktop)]
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;

// ─── PDF chunked transfer ─────────────────────────────────────────────────────
//
// ROOT CAUSE (Android): Tauri on Android cannot use the custom protocol for IPC
// (the desktop fast path). It is forced to use postMessage, which has a practical
// limit of ~1 MB for the full JSON payload. A PDF with a company logo or many
// line items easily encodes to 500 KB+ of base64, silently exceeding that limit.
// Rust then receives an empty string, decodes zero bytes, and writes a 0-byte file.
//
// FIX: split the base64 on the JS side into 300 KB chunks (307 200 chars, always
// a multiple of 4 so each chunk is independently decodable). Each chunk is sent
// via a separate invoke() call — well within the 1 MB limit. Rust appends the
// decoded raw bytes directly to a .part file in the app cache. After all chunks
// are sent, pdf_finalize renames the .part file, copies it to the public
// Downloads folder (best-effort), and returns the cache path for FileProvider.

/// Receive one base64 chunk of a PDF being transferred from JavaScript.
/// `append = false` → create/truncate; `append = true` → append decoded bytes.
#[tauri::command]
async fn pdf_write_chunk(
    filename: String,
    chunk: String,
    append: bool,
    app: tauri::AppHandle,
) -> Result<(), String> {
    use base64::Engine;
    use std::io::Write;

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(&chunk)
        .map_err(|e| format!("base64 decode chunk: {e}"))?;

    let cache_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&cache_dir).ok();
    let part_path = cache_dir.join(format!("{filename}.part"));

    if append {
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&part_path)
            .map_err(|e| format!("open part file for append: {e}"))?;
        file.write_all(&bytes).map_err(|e| format!("write chunk: {e}"))?;
    } else {
        std::fs::write(&part_path, &bytes)
            .map_err(|e| format!("write first chunk: {e}"))?;
    }

    Ok(())
}

/// Finalize the PDF after all chunks have been written.
/// Renames the .part file to its final name in app cache and returns the path.
#[tauri::command]
async fn pdf_finalize(filename: String, app: tauri::AppHandle) -> Result<String, String> {
    let cache_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    let part_path = cache_dir.join(format!("{filename}.part"));
    let final_path = cache_dir.join(&filename);

    std::fs::rename(&part_path, &final_path)
        .map_err(|e| format!("finalize PDF rename: {e}"))?;

    Ok(final_path.to_string_lossy().to_string())
}

/// Save the finalised PDF from app cache to the public Downloads folder.
/// On Android 10+ (API 29+): uses MediaStore — no permission dialog shown.
/// On Android ≤ 9  (API 28-): requests WRITE_EXTERNAL_STORAGE via the
/// legacy_storage_permission feature of tauri-plugin-android-fs.
/// Returns a display path ("Downloads/StormPOS/<filename>") for toast UI.
#[tauri::command]
async fn pdf_save_to_downloads(filename: String, app: tauri::AppHandle) -> Result<String, String> {
    // Desktop stub — this command is only useful on Android.
    #[cfg(not(target_os = "android"))]
    {
        let _ = (&filename, &app);
        return Ok(format!("(desktop) {filename}"));
    }

    #[cfg(target_os = "android")]
    {
        use tauri_plugin_android_fs::{AndroidFsExt, PublicGeneralPurposeDir};

        // Read the PDF that pdf_finalize wrote to the app cache.
        let cache_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?;
        let cache_path = cache_dir.join(&filename);
        let bytes = std::fs::read(&cache_path)
            .map_err(|e| format!("read cached PDF ({cache_path:?}): {e}"))?;

        if bytes.is_empty() {
            return Err(format!(
                "Cached PDF is 0 bytes — IPC transfer failed. Path: {cache_path:?}"
            ));
        }

        let api = app.android_fs_async();

        // Request storage permission.
        // Android 10+ (API 29+): MediaStore needs no permission — returns true immediately.
        // Android <= 9: shows a WRITE_EXTERNAL_STORAGE dialog (legacy feature enabled).
        let granted = api
            .public_storage()
            .request_permission()
            .await
            .map_err(|e| format!("permission request failed: {e}"))?;

        if !granted {
            return Err("Storage permission denied — cannot save to Downloads".to_string());
        }

        // Write to ~/Downloads/StormPOS/<filename> via Android MediaStore.
        // The file will be visible in the Files app immediately after this call.
        api.public_storage()
            .write_new(
                None,                               // primary storage volume
                PublicGeneralPurposeDir::Downloads, // ~/Downloads/
                format!("StormPOS/{filename}"),     // subdirectory created automatically
                Some("application/pdf"),
                &bytes,
            )
            .await
            .map_err(|e| format!("MediaStore write failed: {e}"))?;

        Ok(format!("Downloads/StormPOS/{filename}"))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            pdf_write_chunk,
            pdf_finalize,
            pdf_save_to_downloads,
        ]);

    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init());

    #[cfg(target_os = "android")]
    let builder = builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sharekit::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_android_fs::init());

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
