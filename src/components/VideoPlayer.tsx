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
  const { videoRef, isPlaying, currentTime, duration, togglePlay, seek, isMuted, toggleMute, hasError, volume, changeVolume } = useVideoPlayer();

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
        <div className="flex w-full mx-auto flex-col gap-2 p-3 flex-shrink-0">
          {/* row 1 */}
          <Slider
            value={[currentTime]}
            max={duration || 0}
            step={0.1}
            onValueChange={([value]) => seek(value)}
            className="w-full"
          />

          {/* row 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={togglePlay}
                className="text-foreground hover:text-primary"
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? <Pause className="size-6" /> : <Play className="size-6" />}
              </button>
            
              <div className="flex items-center group flex-shrink-0">
                <button
                  onClick={toggleMute}
                  className="text-foreground hover:text-primary flex-shrink-0"
                  title={isMuted ? "Activar sonido" : "Silenciar"}
                  >
                  {isMuted || volume === 0 ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
                </button>

                <div className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all duration-200 ease-out flex items-center pr-1">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([val]) => changeVolume(val)}
                    className="w-20 ml-2"
                  />
                </div>
              </div>
            </div>

            <span className="font-mono text-sm text-muted-foreground flex-shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}