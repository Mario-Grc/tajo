use crate::operations::{Trim, FfmpegError};
use std::path::Path;

#[tauri::command]
pub fn run_trim(
    start: String,
    end: String,
    input: String,
    output: Option<String>,
) -> Result<String, FfmpegError> {
    let output = output.unwrap_or_else(|| default_output(&input));
    let trim = Trim { input, output, start, end };
    let ffmpeg = ffmpeg_path();
    trim.run(&ffmpeg)
}

fn ffmpeg_path() -> String {
    Path::new(env!("CARGO_MANIFEST_DIR"))
    .join("binaries")
    .join("ffmpeg.exe")
    .to_string_lossy()
    .into_owned()
}


fn default_output(input: &str) -> String {
    let path = Path::new(input);
    let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("output");
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("mp4");
    let parent = path.parent().unwrap_or(Path::new("."));

    parent.join(format!("{stem}-trimmed.{ext}")).to_string_lossy().into_owned()
}