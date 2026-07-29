//! Operaciones del motor del editor

use serde::Serialize;
use std::process::Command;

/// Estructura para los errores que se enviarán al front
#[derive(Serialize, Debug)]
pub struct FfmpegError {
    pub summary: String,
    pub full: String,
}

/// parámetros de la operacion de recorte
pub struct Trim{
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
    pub fn run(&self, ffmpeg: &str) -> Result<String, FfmpegError> {
        let result = Command::new(ffmpeg).args(self.build_args())
        .output().map_err(|e| FfmpegError {
            summary: format!("no se pudo lanzar ffmpeg: {e}"),
            full: e.to_string(),
        })?;
        
        if result.status.success() {
            Ok(self.output.clone())
        } else {
            let full = String::from_utf8_lossy(&result.stderr).to_string();

            let summary = full.lines().rev().find(|line| !line.trim().is_empty())
                .unwrap_or("ffmpeg falló sin mensaje de error").to_string();

            Err(FfmpegError { summary, full})
        }
    }
}