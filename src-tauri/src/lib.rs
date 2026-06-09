use std::process::Command;
use std::path::PathBuf;
use std::fs;
use std::io::Write;
use std::sync::Mutex;
use tauri::Manager;

// Global state for ADB path
struct AppState {
    adb_path: Mutex<String>,
    scrcpy_path: Mutex<String>,
}

// Detect ADB in common locations
fn detect_adb() -> String {
    let android_path = PathBuf::from("C:\\Android\\platform-tools\\adb.exe");
    if android_path.exists() {
        return android_path.to_string_lossy().to_string();
    }

    if let Ok(output) = Command::new("where").arg("adb").output() {
        let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !path.is_empty() {
            return path.lines().next().unwrap_or("adb").to_string();
        }
    }

    "adb".to_string()
}

fn detect_scrcpy() -> String {
    let android_path = PathBuf::from("C:\\Android\\scrcpy\\scrcpy.exe");
    if android_path.exists() {
        return android_path.to_string_lossy().to_string();
    }

    if let Ok(output) = Command::new("where").arg("scrcpy").output() {
        let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !path.is_empty() {
            return path.lines().next().unwrap_or("scrcpy").to_string();
        }
    }

    "scrcpy".to_string()
}

#[tauri::command]
fn get_adb_path(state: tauri::State<AppState>) -> String {
    state.adb_path.lock().unwrap().clone()
}

#[tauri::command]
fn get_scrcpy_path(state: tauri::State<AppState>) -> String {
    state.scrcpy_path.lock().unwrap().clone()
}

#[tauri::command]
fn set_adb_path(state: tauri::State<AppState>, path: String) -> String {
    *state.adb_path.lock().unwrap() = path.clone();
    format!("ADB path set to: {}", path)
}

#[tauri::command]
fn set_scrcpy_path(state: tauri::State<AppState>, path: String) -> String {
    *state.scrcpy_path.lock().unwrap() = path.clone();
    format!("scrcpy path set to: {}", path)
}

#[tauri::command]
fn check_adb_installed(state: tauri::State<AppState>) -> bool {
    let adb = state.adb_path.lock().unwrap().clone();
    Command::new(&adb).arg("version").output().is_ok()
}

#[tauri::command]
fn check_scrcpy_installed(state: tauri::State<AppState>) -> bool {
    let scrcpy = state.scrcpy_path.lock().unwrap().clone();
    Command::new(&scrcpy).arg("--version").output().is_ok()
}

#[tauri::command]
async fn download_adb() -> Result<String, String> {
    let url = "https://dl.google.com/android/repository/platform-tools-latest-windows.zip";
    let install_dir = PathBuf::from("C:\\Android");

    fs::create_dir_all(&install_dir).map_err(|e| format!("Failed to create dir: {}", e))?;

    let zip_path = install_dir.join("platform-tools.zip");

    let response = reqwest::get(url).await.map_err(|e| format!("Download failed: {}", e))?;
    let bytes = response.bytes().await.map_err(|e| format!("Read failed: {}", e))?;

    let mut file = fs::File::create(&zip_path).map_err(|e| format!("File create failed: {}", e))?;
    file.write_all(&bytes).map_err(|e| format!("Write failed: {}", e))?;

    let zip_file = fs::File::open(&zip_path).map_err(|e| format!("Open zip failed: {}", e))?;
    let mut archive = zip::ZipArchive::new(zip_file).map_err(|e| format!("Zip read failed: {}", e))?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| format!("Extract error: {}", e))?;
        let outpath = install_dir.join(file.mangled_name());

        if file.is_dir() {
            fs::create_dir_all(&outpath).ok();
        } else {
            if let Some(p) = outpath.parent() {
                fs::create_dir_all(p).ok();
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| format!("Create out failed: {}", e))?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| format!("Copy failed: {}", e))?;
        }
    }

    fs::remove_file(&zip_path).ok();
    Ok("ADB installed to C:\\Android\\platform-tools\\".to_string())
}

#[tauri::command]
async fn download_scrcpy() -> Result<String, String> {
    let url = "https://github.com/Genymobile/scrcpy/releases/download/v2.7/scrcpy-win64-v2.7.zip";
    let install_dir = PathBuf::from("C:\\Android");

    fs::create_dir_all(&install_dir).map_err(|e| format!("Failed to create dir: {}", e))?;

    let zip_path = install_dir.join("scrcpy.zip");

    let response = reqwest::get(url).await.map_err(|e| format!("Download failed: {}", e))?;
    let bytes = response.bytes().await.map_err(|e| format!("Read failed: {}", e))?;

    let mut file = fs::File::create(&zip_path).map_err(|e| format!("File create failed: {}", e))?;
    file.write_all(&bytes).map_err(|e| format!("Write failed: {}", e))?;

    let zip_file = fs::File::open(&zip_path).map_err(|e| format!("Open zip failed: {}", e))?;
    let mut archive = zip::ZipArchive::new(zip_file).map_err(|e| format!("Zip read failed: {}", e))?;

    let scrcpy_dir = install_dir.join("scrcpy");
    fs::create_dir_all(&scrcpy_dir).ok();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| format!("Extract error: {}", e))?;
        let name = file.mangled_name();
        let stripped: PathBuf = name.components().skip(1).collect();
        if stripped.as_os_str().is_empty() {
            continue;
        }
        let outpath = scrcpy_dir.join(stripped);

        if file.is_dir() {
            fs::create_dir_all(&outpath).ok();
        } else {
            if let Some(p) = outpath.parent() {
                fs::create_dir_all(p).ok();
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| format!("Create out failed: {}", e))?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| format!("Copy failed: {}", e))?;
        }
    }

    fs::remove_file(&zip_path).ok();
    Ok("scrcpy installed to C:\\Android\\scrcpy\\".to_string())
}

// ============ ADB COMMANDS ============

#[tauri::command]
fn adb_devices(state: tauri::State<AppState>) -> String {
    let adb = state.adb_path.lock().unwrap().clone();
    let output = Command::new(adb).arg("devices").output();
    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_set_dpi(state: tauri::State<AppState>, serial: String, dpi: String) -> String {
    let adb = state.adb_path.lock().unwrap().clone();
    let output = Command::new(adb)
        .args(["-s", &serial, "shell", "wm", "density", &dpi])
        .output();
    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_reset_dpi(state: tauri::State<AppState>, serial: String) -> String {
    let adb = state.adb_path.lock().unwrap().clone();
    let output = Command::new(adb)
        .args(["-s", &serial, "shell", "wm", "density", "reset"])
        .output();
    match output {
        Ok(_) => "DPI reset success".to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_get_dpi(state: tauri::State<AppState>, serial: String) -> String {
    let adb = state.adb_path.lock().unwrap().clone();
    let output = Command::new(adb)
        .args(["-s", &serial, "shell", "wm", "density"])
        .output();
    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_kill(state: tauri::State<AppState>) -> String {
    let adb = state.adb_path.lock().unwrap().clone();
    let output = Command::new(adb).arg("kill-server").output();
    match output {
        Ok(_) => "ADB killed".to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_install(state: tauri::State<AppState>, serial: String, path: String) -> String {
    let adb = state.adb_path.lock().unwrap().clone();
    let output = Command::new(adb)
        .args(["-s", &serial, "install", &path])
        .output();
    match output {
        Ok(o) => {
            let stdout = String::from_utf8_lossy(&o.stdout).to_string();
            let stderr = String::from_utf8_lossy(&o.stderr).to_string();
            format!("{}\n{}", stdout, stderr)
        }
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_reboot(state: tauri::State<AppState>, serial: String, mode: String) -> String {
    let adb = state.adb_path.lock().unwrap().clone();
    let mut args = vec!["-s", &serial, "reboot"];
    if mode != "normal" {
        args.push(&mode);
    }
    let output = Command::new(adb).args(&args).output();
    match output {
        Ok(_) => format!("Rebooting to {}...", mode),
        Err(e) => format!("Error: {}", e),
    }
}

// ============ SCREEN ROTATION ============ // <-- NEW

#[tauri::command]
fn rotate_screen(state: tauri::State<AppState>, serial: String, direction: String) -> Result<String, String> {
    let adb = state.adb_path.lock().unwrap().clone();

    let rotation_value = match direction.as_str() {
        "portrait" => "0",
        "landscape_left" => "1",
        "upside_down" => "2",
        "landscape_right" => "3",
        _ => return Err("Invalid rotation".to_string()),
    };

    // Disable auto-rotate first so the manual setting sticks
    Command::new(&adb)
        .args(["-s", &serial, "shell", "settings", "put", "system", "accelerometer_rotation", "0"])
        .output()
        .ok();

    // Set the new rotation
    let output = Command::new(&adb)
        .args(["-s", &serial, "shell", "settings", "put", "system", "user_rotation", rotation_value])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!("Rotated to {}", direction))
    } else {
        Err("Failed to rotate".to_string())
    }
}

#[tauri::command]
fn launch_scrcpy(
    state: tauri::State<AppState>,
    serial: String,
    max_size: String,
    bitrate: String,
    max_fps: String,
    video_codec: String,
    stay_awake: bool,
    turn_screen_off: bool,
    disable_screensaver: bool,
    always_on_top: bool,
    no_audio: bool,
    fullscreen: bool,
) -> String {
    let scrcpy = state.scrcpy_path.lock().unwrap().clone();

    let mut args: Vec<String> = vec![
        "-s".to_string(), serial,
        format!("--video-codec={}", video_codec),
        "--keyboard=uhid".to_string(),
        "--video-bit-rate".to_string(), bitrate,
        "--max-fps".to_string(), max_fps,
        "--max-size".to_string(), max_size,
    ];

    if stay_awake { args.push("--stay-awake".to_string()); }
    if turn_screen_off { args.push("--turn-screen-off".to_string()); }
    if disable_screensaver { args.push("--disable-screensaver".to_string()); }
    if always_on_top { args.push("--always-on-top".to_string()); }
    if no_audio { args.push("--no-audio".to_string()); }
    if fullscreen { args.push("--fullscreen".to_string()); }

    match Command::new(scrcpy).args(&args).spawn() {
        Ok(_) => "scrcpy launched successfully".to_string(),
        Err(e) => format!("Failed to spawn scrcpy: {}", e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let adb_path = detect_adb();
    let scrcpy_path = detect_scrcpy();

    tauri::Builder::default()
        .manage(AppState {
            adb_path: Mutex::new(adb_path),
            scrcpy_path: Mutex::new(scrcpy_path),
        })
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            adb_devices,
            adb_set_dpi,
            adb_reset_dpi,
            adb_get_dpi,
            adb_kill,
            adb_install,
            adb_reboot,
            launch_scrcpy,
            get_adb_path,
            get_scrcpy_path,
            set_adb_path,
            set_scrcpy_path,
            check_adb_installed,
            check_scrcpy_installed,
            download_adb,
            download_scrcpy,
            rotate_screen // <-- NEW
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}