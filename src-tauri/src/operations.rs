//! Operaciones del motor del editor

use serde::Serialize;
use tauri_plugin_shell::process::Command;

/// Estructura para los errores que se enviarán al front
#[derive(Serialize, Debug)]
pub struct FfmpegError {
    pub summary: String,
    pub full: String,
}

/// parámetros de la operacion de recorte
pub struct Trim {
    pub input: String,
    pub output: String,
    pub start: String,
    pub end: String,
}

impl Trim {
    /// Constructor de la lista de argumentos para ffmpeg
    pub fn build_args(&self) -> Vec<String> {
        vec![
            "-ss".to_string(),
            self.start.clone(),
            "-to".to_string(),
            self.end.clone(),
            "-i".to_string(),
            self.input.clone(),
            "-c".to_string(),
            "copy".to_string(),
            "-y".to_string(),
            self.output.clone(),
        ]
    }

    /// lanzar ffmpeg y ejecutar el recorte
    pub async fn run(&self, ffmpeg: Command) -> Result<String, FfmpegError> {
        let result = ffmpeg
            .args(self.build_args())
            .output()
            .await
            .map_err(|e| FfmpegError {
                summary: format!("no se pudo lanzar ffmpeg: {e}"),
                full: e.to_string(),
            })?;

        if result.status.success() {
            Ok(self.output.clone())
        } else {
            let full = String::from_utf8_lossy(&result.stderr).to_string();

            let summary = full
                .lines()
                .rev()
                .find(|line| !line.trim().is_empty())
                .unwrap_or("ffmpeg falló sin mensaje de error")
                .to_string();

            Err(FfmpegError { summary, full })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trim_build_args_lossless_copy() {
        let trim = Trim {
            input: "input.mp4".to_string(),
            output: "output.mp4".to_string(),
            start: "00:01:00".to_string(),
            end: "00:02:30".to_string(),
        };

        let args = trim.build_args();

        assert_eq!(
            args.iter().map(String::as_str).collect::<Vec<_>>(),
            vec![
                "-ss", "00:01:00", "-to", "00:02:30", "-i", "input.mp4",
                "-c", "copy", "-y", "output.mp4",
            ]
        );
    }

    #[test]
    fn trim_build_args_preserves_paths_with_spaces() {
        let trim = Trim {
            input: "my clips/input video.mp4".to_string(),
            output: "output/final cut.mp4".to_string(),
            start: "00:00:00".to_string(),
            end: "00:00:10".to_string(),
        };

        let args = trim.build_args();

        assert!(args.contains(&"my clips/input video.mp4".to_string()));
        assert!(args.contains(&"output/final cut.mp4".to_string()));
    }
}