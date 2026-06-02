#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
fn adb_devices() -> String {
    let output = Command::new("adb")
        .arg("devices")
        .output();

    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_set_dpi(serial: String, dpi: String) -> String {
    let output = Command::new("adb")
        .args(["-s", &serial, "shell", "wm", "density", &dpi])
        .output();

    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_reset_dpi(serial: String) -> String {
    let output = Command::new("adb")
        .args(["-s", &serial, "shell", "wm", "density", "reset"])
        .output();

    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_kill() -> String {
    let output = Command::new("adb")
        .arg("kill-server")
        .output();

    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn adb_install(serial: String, path: String) -> String {
    let output = Command::new("adb")
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
fn adb_get_dpi(serial: String) -> String {
    let output = Command::new("adb")
        .args(["-s", &serial, "shell", "wm", "density"])
        .output();

    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            adb_devices,
            adb_set_dpi,
            adb_reset_dpi,
            adb_kill,
            adb_install,
            adb_get_dpi
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

