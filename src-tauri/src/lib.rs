use std::process::Command;
use std::path::PathBuf;
use tauri::Manager;

fn get_binary_path(app: &tauri::AppHandle, name: &str) -> PathBuf {
    if let Ok(res_dir) = app.path().resource_dir() {
        let path = res_dir.join("binaries").join(name);
        if path.exists() {
            return path;
        }
    }
    PathBuf::from(name)
}

#[tauri::command]
fn adb_devices(app: tauri::AppHandle) -> String {
    let adb = get_binary_path(&app, "adb.exe");
    let output = Command::new(adb).arg("devices").output();
    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_set_dpi(app: tauri::AppHandle, serial: String, dpi: String) -> String {
    let adb = get_binary_path(&app, "adb.exe");
    let output = Command::new(adb)
        .args(["-s", &serial, "shell", "wm", "density", &dpi])
        .output();
    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_reset_dpi(app: tauri::AppHandle, serial: String) -> String {
    let adb = get_binary_path(&app, "adb.exe");
    let output = Command::new(adb)
        .args(["-s", &serial, "shell", "wm", "density", "reset"])
        .output();
    match output {
        Ok(_) => "DPI reset success".to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_get_dpi(app: tauri::AppHandle, serial: String) -> String {
    let adb = get_binary_path(&app, "adb.exe");
    let output = Command::new(adb)
        .args(["-s", &serial, "shell", "wm", "density"])
        .output();
    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_kill(app: tauri::AppHandle) -> String {
    let adb = get_binary_path(&app, "adb.exe");
    let output = Command::new(adb).arg("kill-server").output();
    match output {
        Ok(_) => "ADB killed".to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_install(app: tauri::AppHandle, serial: String, path: String) -> String {
    let adb = get_binary_path(&app, "adb.exe");
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
fn adb_reboot(app: tauri::AppHandle, serial: String, mode: String) -> String {
    let adb = get_binary_path(&app, "adb.exe");
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

#[tauri::command]
fn launch_scrcpy(
    app: tauri::AppHandle,
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
    let scrcpy = get_binary_path(&app, "scrcpy.exe");

    if !scrcpy.exists() {
        return format!("Error: scrcpy.exe not found at {:?}", scrcpy);
    }

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
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            adb_devices,
            adb_set_dpi,
            adb_reset_dpi,
            adb_get_dpi,
            adb_kill,
            adb_install,
            adb_reboot,
            launch_scrcpy
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}