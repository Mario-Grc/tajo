# Tajo
Simple, lightweight desktop video editor built for quick video trimming. It isn't meant to replace other full-fledged video editing software. There are no complex timelines or heavy effects here.

Created both as a practical tool for everyday clip editing and as a learning project to explore Rust and [Tauri v2](https://v2.tauri.app/).

<img src="main-screenshot.png" alt="main screenshot" width="800"/>

## Status
Actively in development. Core workflow working:
- Load a video (file picker or drag and drop)
- Preview with a built-in player
- Lossless trim
- Export to a chosen path

## Stack

<p align="left">
  <a href="https://v2.tauri.app/"><img src="https://cdn.simpleicons.org/tauri" width="40" height="40" title="Tauri v2" /></a>&nbsp;&nbsp;
  <a href="https://react.dev/"><img src="https://cdn.simpleicons.org/react" width="40" height="40" title="React" /></a>&nbsp;&nbsp;
  <a href="https://www.typescriptlang.org/"><img src="https://cdn.simpleicons.org/typescript" width="40" height="40" title="TypeScript" /></a>&nbsp;&nbsp;
  <a href="https://tailwindcss.com/"><img src="https://cdn.simpleicons.org/tailwindcss" width="40" height="40" title="Tailwind CSS" /></a>&nbsp;&nbsp;
  <a href="https://www.rust-lang.org/"><img src="https://cdn.simpleicons.org/rust" width="40" height="40" title="Rust" /></a>&nbsp;&nbsp;
  <a href="https://ffmpeg.org/"><img src="https://cdn.simpleicons.org/ffmpeg" width="40" height="40" title="FFmpeg" /></a>
</p>

- [Tauri v2](https://v2.tauri.app/) (web frontend + Rust backend)
- React + TypeScript + Tailwind CSS v4 + shadcn/ui
- Rust for the operations engine (building and running ffmpeg commands)
- ffmpeg as an external process

## Running locally

Requirements:
 
- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install)
- `ffmpeg.exe` binary located in `src-tauri/binaries/`
```bash
npm install
npm run tauri dev
```