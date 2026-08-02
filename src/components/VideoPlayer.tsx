import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

interface VideoPlayerProps {
  inputPath: string;
}

export function VideoPlayer({ inputPath }: VideoPlayerProps) {
  const { videoRef, isPlaying, currentTime, duration, togglePlay, seek, isMuted, toggleMute, hasError } = useVideoPlayer();

  const assetUrl = convertFileSrc(inputPath);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 min-h-0 items-center justify-center">
        {hasError ? (
          <p className="text-sm text-muted-foreground">
            No se pudo cargar el vídeo. Comprueba la ruta.
          </p>
        ) : (
          <video ref={videoRef} src={assetUrl} className="h-full w-full object-contain" />
        )}
      </div>

      {!hasError && (
        <div className="flex w-full max-w-xl mx-auto items-center gap-3 p-3 flex-shrink-0">
          <button
            onClick={togglePlay}
            className="text-foreground hover:text-primary"
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>

          <span className="text-right font-mono text-xs text-muted-foreground">
            {formatTime(currentTime)}
          </span>

          <Slider
            value={[currentTime]}
            max={duration || 0}
            step={0.1}
            onValueChange={([value]) => seek(value)}
            className="flex-1"
          />

          <span className="font-mono text-xs text-muted-foreground">
            {formatTime(duration)}
          </span>

          <button
            onClick={toggleMute}
            className="text-foreground hover:text-primary flex-shrink-0"
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >

            {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
        </div>
      )}
    </div>
  );
}