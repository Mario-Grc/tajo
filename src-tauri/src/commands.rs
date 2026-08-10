use crate::binaries::ffmpeg_command;
use crate::operations::{FfmpegError, Trim};
use serde::Serialize;
use std::path::Path;

#[derive(Serialize, Debug)]
pub struct DeleteError {
    pub summary: String,
}

#[tauri::command]
pub fn delete_video(path: String) -> Result<(), DeleteError> {
    trash::delete(&path).map_err(|e| DeleteError {
        summary: format!("No se pudo eliminar el archivo: {e}"),
    })
}

#[tauri::command]
pub async fn run_trim(
    app: tauri::AppHandle,
    start: String,
    end: String,
    input: String,
    output: Option<String>,
) -> Result<String, FfmpegError> {
    let output = output.unwrap_or_else(|| default_output(&input));
    let trim = Trim {
        input,
        output,
        start,
        end,
    };
    let ffmpeg = ffmpeg_command(&app);
    trim.run(ffmpeg).await
}

fn default_output(input: &str) -> String {
    let path = Path::new(input);
    let stem = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("output");
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("mp4");
    let parent = path.parent().unwrap_or(Path::new("."));

    parent
        .join(format!("{stem}-trimmed.{ext}"))
        .to_string_lossy()
        .into_owned()
}