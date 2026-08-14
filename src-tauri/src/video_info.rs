use crate::binaries::{ffmpeg_command, ffprobe_command};
use crate::operations::FfmpegError;
use base64::{engine::general_purpose::STANDARD, Engine};
use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_shell::process::CommandEvent;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VideoInfo {
    pub duration_sec: f64,
    pub thumbnail_base64: String,
}

#[tauri::command]
pub async fn get_video_info(app: AppHandle, input_path: String) -> Result<VideoInfo, FfmpegError> {
    let duration_sec = probe_duration(&app, &input_path).await?;
    let thumbnail_base64 = generate_thumbnail(&app, &input_path).await?;

    Ok(VideoInfo {
        duration_sec,
        thumbnail_base64,
    })
}

async fn probe_duration(app: &AppHandle, input_path: &str) -> Result<f64, FfmpegError> {
    let output = ffprobe_command(app)
        .args([
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            input_path,
        ])
        .output()
        .await
        .map_err(|e| FfmpegError {
            summary: "No se pudo ejecutar ffprobe".to_string(),
            full: e.to_string(),
        })?;

    if !output.status.success() {
        let full = String::from_utf8_lossy(&output.stderr).to_string();
        let summary = extract_summary(&full, "ffprobe falló sin mensaje de error");

        return Err(FfmpegError { summary, full });
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value = serde_json::from_str(&json_str).map_err(|e| FfmpegError {
        summary: "No se pudo leer la duración del vídeo".to_string(),
        full: format!("{e}\nsalida de ffprobe: {json_str}"),
    })?;

    parsed["format"]["duration"]
        .as_str()
        .and_then(|value| value.parse::<f64>().ok())
        .ok_or_else(|| FfmpegError {
            summary: "Duración no encontrada en la salida de ffprobe".to_string(),
            full: json_str.to_string(),
        })
}

async fn generate_thumbnail(app: &AppHandle, input_path: &str) -> Result<String, FfmpegError> {
    let (mut rx, _child) = ffmpeg_command(app)
        .args([
            "-ss",
            "00:00:01",
            "-i",
            input_path,
            "-vframes",
            "1",
            "-s",
            "320x180",
            "-q:v",
            "3",
            "-f",
            "image2pipe",
            "-vcodec",
            "mjpeg",
            "pipe:1",
        ])
        .spawn()
        .map_err(|e| FfmpegError {
            summary: "No se pudo ejecutar ffmpeg".to_string(),
            full: e.to_string(),
        })?;

    let mut stdout = Vec::new();
    let mut stderr = Vec::new();
    let mut exit_code = None;

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(chunk) => stdout.extend(chunk),
            CommandEvent::Stderr(chunk) => stderr.extend(chunk),
            CommandEvent::Terminated(payload) => exit_code = payload.code,
            CommandEvent::Error(err) => {
                return Err(FfmpegError {
                    summary: "Error al ejecutar ffmpeg".to_string(),
                    full: err,
                });
            }
            _ => {}
        }
    }

    if exit_code == Some(0) {
        Ok(STANDARD.encode(&stdout))
    } else {
        let full = String::from_utf8_lossy(&stderr).to_string();
        let summary = extract_summary(&full, "ffmpeg falló al generar la miniatura");
        Err(FfmpegError { summary, full })
    }
}

fn extract_summary(full: &str, fallback: &str) -> String {
    full.lines()
        .rev()
        .find(|line| !line.trim().is_empty())
        .map(|line| line.to_string())
        .unwrap_or_else(|| fallback.to_string())
}
