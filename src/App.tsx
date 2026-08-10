import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { VideoPlayer } from "./components/VideoPlayer";
import { Header } from "./components/Header";
import {
  truncate,
  computeDefaultOutputPath,
  buildQueueItems,
  pickVideos,
} from "./utils/fileUtils";
import { useFileDrop } from "./hooks/useFileDrop";
import { QueueSidebar } from "./components/QueueSidebar";
import { PropertiesSidebar } from "./components/PropertiesSidebar";
import { useVideoQueue } from "./hooks/useVideoQueue";
import "sonner/dist/styles.css";

interface FfmpegError {
  summary: string;
  full: string;
}

interface DeleteError {
  summary: string;
}

function formatTimecode(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "00:00:00";

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function isValidTrimRange(start: number, end: number, durationSec: number | null): string | null {
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "Los tiempos de inicio y fin deben ser válidos.";
  }

  if (start < 0 || end < 0) {
    return "Los tiempos de inicio y fin no pueden ser negativos.";
  }

  if (start >= end) {
    return "El tiempo de inicio debe ser menor que el tiempo de fin.";
  }

  if (durationSec !== null && end > durationSec) {
    return "El tiempo de fin supera la duración del vídeo.";
  }

  return null;
}

function App() {
  const queue = useVideoQueue();
  const selectedItem = queue.selectedItem;
  const isProcessing = queue.processingItemId !== null;

  const handleAddVideos = async (filePaths: string[]) => {
    if (filePaths.length === 0) return;

    const items = await buildQueueItems(filePaths);
    queue.addItems(items);
  };

  const handlePickInput = async () => {
    const selected = await pickVideos();

    if (selected.length > 0) {
      await handleAddVideos(selected);
    }
  };

  const handlePickOutput = async () => {
    if (!selectedItem) return;

    const defaultPath = selectedItem.outputPath || (selectedItem.inputPath ? await computeDefaultOutputPath(selectedItem.inputPath) : undefined);

    const selected = await save({
      defaultPath,
      filters: [{ name: "Vídeo", extensions: ["mp4"] }],
    });

    if (selected) {
      queue.updateItem(selectedItem.id, { outputPath: selected });
    }
  };

  const { isDragging } = useFileDrop(handleAddVideos);

  const handleTrim = async () => {
    if (!selectedItem) {
      toast.error("Selecciona primero el vídeo de entrada.");
      return;
    }
    if (selectedItem.startTime === null || selectedItem.endTime === null) {
      toast.error("Los tiempos de inicio y fin no pueden estar vacíos.");
      return;
    }
    if (!selectedItem.inputPath) {
      toast.error("Selecciona primero el vídeo de entrada.");
      return;
    }
    if (!selectedItem.outputPath) {
      toast.error("Elige dónde guardar el resultado.");
      return;
    }

    const rangeError = isValidTrimRange(selectedItem.startTime, selectedItem.endTime, selectedItem.durationSec);
    if (rangeError) {
      toast.error(rangeError);
      return;
    }

    const item = selectedItem;
    queue.setProcessing(item.id);
    queue.setStatus(item.id, "processing");
    const toastId = toast.info("Procesando recorte...");

    try {
      const result = await invoke<string>("run_trim", {
        start: formatTimecode(item.startTime),
        end: formatTimecode(item.endTime),
        input: item.inputPath,
        output: item.outputPath,
      });

      queue.setStatus(item.id, "completed");
      toast.success(truncate(`Recorte completado. Guardado en: ${result}`), { id: toastId });
    } catch (error) {
      const err = error as FfmpegError;

      console.error("[FFmpeg Full Log]:\n", err.full);

      const errorMessage = err.summary || String(error);

      queue.setStatus(item.id, "error", errorMessage);

      toast.error(truncate(errorMessage), { id: toastId });
    } finally {
      queue.setProcessing(null);
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedItem) return;

    const item = selectedItem;

    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      await invoke("delete_video", { path: item.inputPath });
      queue.removeItem(item.id);

      toast.success("Vídeo eliminado correctamente");
    } catch (err) {
      const error = err as DeleteError;
      console.error("Error al borrar el vídeo:", error.summary ?? err);
      toast.error(error.summary ?? "No se pudo eliminar el vídeo");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground select-none">
      {/* Header */}
      <Header />

      {/* main content with 3 columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* left panel: video queue */}
        <QueueSidebar
          items={queue.items}
          selectedId={queue.selectedId}
          onSelect={queue.selectItem}
          onRemove={queue.removeItem}
        />

        {/* video panel */}
        <main className="relative flex-1 flex items-center justify-center overflow-y-auto">
          {isDragging && (
            <div className="absolute inset-4 z-50 flex flex-col items-center justify-center border border-dashed border-primary bg-background/90 backdrop-blur-xs pointer-events-none">
              <Upload className="size-10 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">
                Suelta el vídeo para editar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formatos compatibles: MP4, MOV, MKV, AVI...
              </p>
            </div>
          )}

          {selectedItem ? (
            <VideoPlayer key={selectedItem.inputPath} inputPath={selectedItem.inputPath} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecciona un vídeo para comenzar.
            </p>
          )}
        </main>

        {/* right panel: properties */}
        <PropertiesSidebar
          item={selectedItem}
          isProcessing={isProcessing}
          onInputChange={(path) => {
            if (!selectedItem) return;
            queue.updateItem(selectedItem.id, { inputPath: path });
          }}
          onOutputChange={(path) => {
            if (!selectedItem) return;
            queue.updateItem(selectedItem.id, { outputPath: path });
          }}
          onStartTimeChange={(time) => {
            if (!selectedItem) return;
            queue.updateItem(selectedItem.id, { startTime: time });
          }}
          onEndTimeChange={(time) => {
            if (!selectedItem) return;
            queue.updateItem(selectedItem.id, { endTime: time });
          }}
          onPickInput={handlePickInput}
          onPickOutput={handlePickOutput}
          onTrim={handleTrim}
          onDeleteVideo={handleDeleteVideo}
        />

      </div>

      {/* Footer placeholder... */}

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "!bg-popover !border !border-border !rounded-none !text-foreground break-words",
            description: "!text-muted-foreground",
          },
          style: { maxWidth: "380px" },
        }}
      />
    </div>
  );
}

export default App;