use tauri::AppHandle;
use tauri_plugin_shell::process::Command;
use tauri_plugin_shell::ShellExt;

pub fn ffmpeg_command(app: &AppHandle) -> Command {
    app.shell()
        .sidecar("ffmpeg")
        .expect("no se pudo crear el comando sidecar de ffmpeg")
}

pub fn ffprobe_command(app: &AppHandle) -> Command {
    app.shell()
        .sidecar("ffprobe")
        .expect("no se pudo crear el comando sidecar de ffprobe")
}