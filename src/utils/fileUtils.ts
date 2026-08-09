import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { dirname, join } from "@tauri-apps/api/path";
import type { QueueItem } from "../types/queue";
import type { VideoInfo } from "../types/video-info";

export const VIDEO_EXTENSIONS = ["mp4", "mov", "mkv", "avi", "webm", "m4v", "wmv", "flv"];

export function truncate(text: string, max = 180) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export async function computeDefaultOutputPath(inputPath: string): Promise<string> {
  const dir = await dirname(inputPath);
  const fullName = inputPath.split(/[\\/]/).pop() ?? "output.mp4";
  const dotIndex = fullName.lastIndexOf(".");
  const nameWithoutExt = dotIndex > 0 ? fullName.slice(0, dotIndex) : fullName;
  const ext = dotIndex > 0 ? fullName.slice(dotIndex) : "";
  return join(dir, `${nameWithoutExt}_recortado${ext}`);
}

export async function pickVideos(): Promise<string[]> {
  const selected = await open({
    multiple: true,
    filters: [{ name: "Vídeos", extensions: VIDEO_EXTENSIONS }],
  });

  if (!selected) return [];

  return Array.isArray(selected) ? selected : [selected];
}

export async function buildQueueItems(paths: string[]): Promise<QueueItem[]> {
  return Promise.all(
    paths.map(async (inputPath): Promise<QueueItem> => {
      const fileName = inputPath.split(/[\\/]/).pop() ?? inputPath;

      try {
        const [outputPath, info] = await Promise.all([
          computeDefaultOutputPath(inputPath),
          invoke<VideoInfo>("get_video_info", { inputPath }),
        ]);

        return {
          id: crypto.randomUUID(),
          inputPath,
          outputPath,
          fileName,
          durationSec: info.durationSec,
          startTime: null,
          endTime: null,
          thumbnailUrl: `data:image/jpeg;base64,${info.thumbnailBase64}`,
          status: "pending",
        };
      } catch {
        return {
          id: crypto.randomUUID(),
          inputPath,
          outputPath: await computeDefaultOutputPath(inputPath),
          fileName,
          durationSec: null,
          startTime: null,
          endTime: null,
          thumbnailUrl: null,
          status: "error",
          errorMessage: "No se pudo leer el vídeo",
        };
      }
    })
  );
}