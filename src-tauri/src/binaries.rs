use std::path::Path;

pub fn ffmpeg_path() -> String {
    binary_path("ffmpeg.exe")
}

pub fn ffprobe_path() -> String {
    binary_path("ffprobe.exe")
}

fn binary_path(binary_name: &str) -> String {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("binaries")
        .join(binary_name)
        .to_string_lossy()
        .into_owned()
}