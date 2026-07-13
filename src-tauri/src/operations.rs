//! Operaciones del motor del editor

use std::process::Command;

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
    pub fn run(&self, ffmpeg: &str) -> Result<String, String> {
        let result = Command::new(ffmpeg).args(self.build_args())
        .output().map_err(|e| format!("no se pudo lanzar ffmpeg: {e}"))?;
        
        if result.status.success() {
            Ok(self.output.clone())
        } else {
            let stderr = String::from_utf8_lossy(&result.stderr);
            Err(format!("ffmpeg terminó con el siguiente error: {stderr}"))
        }
    }
}