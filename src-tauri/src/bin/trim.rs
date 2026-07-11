//! Programa de terminal para probar la operación de recorte.

use std::env::args;
use tajo_lib::operations::Trim;
use std::path::Path;

fn main() {
    let args: Vec<String> = args().collect();

    if args.len() < 4 {
        eprintln!("Uso: cargo run --bin trim -- <entrada> <inicio> <fin> [salida]");
        eprintln!("Ej:  cargo run --bin trim -- video.mp4 00:00:05 00:00:12");
        std::process::exit(1);
    }

    let start: String = args[2].clone();
    let end: String = args[3].clone();
    let input: String = args[1].clone();
    let output: String = args.get(4).cloned().unwrap_or_else(|| default_output(&input));
    
    let trim: Trim = Trim { input, output, start, end };

    match trim.run(&ffmpeg_path()) {
        Ok(()) => println!("Listo: {}", trim.output),
        Err(e) => {
            eprintln!("Error: {e}"); 
            std::process::exit(1);
        }
    }
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