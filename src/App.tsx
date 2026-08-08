import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { VideoPlayer } from "./components/VideoPlayer";
import { Header } from "./components/Header";
import { VIDEO_EXTENSIONS, truncate, computeDefaultOutputPath } from "./utils/fileUtils";
import { useFileDrop } from "./hooks/useFileDrop";
import { QueueSidebar } from "./components/QueueSidebar";
import { PropertiesSidebar } from "./components/PropertiesSidebar";

interface FfmpegError {
  summary: string;
  full: string;
}

interface DeleteError {
  summary: string;
}

function App() {
  const [inputPath, setInputPath] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");
  const [loading, setLoading] = useState(false);

  const queueCount = 0; // TODO

  const handleSelectVideo = async (filePath: string) => {
    setInputPath(filePath);
    const defaultOut = await computeDefaultOutputPath(filePath);
    setOutputPath(defaultOut);
  };

  const handlePickInput = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Vídeos", extensions: VIDEO_EXTENSIONS }],
    });

    if (typeof selected === "string") {
      await handleSelectVideo(selected);
    }
  };

  const handlePickOutput = async () => {
    const defaultPath = outputPath || (inputPath ? await computeDefaultOutputPath(inputPath) : undefined);

    const selected = await save({
      defaultPath,
      filters: [{ name: "Vídeo", extensions: ["mp4"] }],
    });

    if (selected) setOutputPath(selected);
  };

  const { isDragging } = useFileDrop(handleSelectVideo);

  const handleTrim = async () => {
    if (!inputPath) {
      toast.error("Selecciona primero el vídeo de entrada.");
      return;
    }
    if (!outputPath) {
      toast.error("Elige dónde guardar el resultado.");
      return;
    }

    setLoading(true);
    const toastId = toast.info("Procesando recorte...");

    try {
      const result = await invoke<string>("run_trim", {
        start: startTime,
        end: endTime,
        input: inputPath,
        output: outputPath,
      });

      toast.success(truncate(`Recorte completado. Guardado en: ${result}`), { id: toastId });
    } catch (error) {
      const err = error as FfmpegError;

      console.error("[FFmpeg Full Log]:\n", err.full);

      const errorMessage = err.summary || String(error);

      toast.error(truncate(errorMessage), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!inputPath) return;

    const pathToDelete = inputPath;

    try {
      setInputPath("");
      setStartTime("");
      setEndTime("");

      await new Promise((resolve) => setTimeout(resolve, 50));
      await invoke("delete_video", { path: pathToDelete });

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
        <QueueSidebar queueCount={queueCount} />

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

          {inputPath ? (
            <VideoPlayer key={inputPath} inputPath={inputPath} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecciona un vídeo para comenzar.
            </p>
          )}
        </main>

        {/* right panel: properties */}
        <PropertiesSidebar
          inputPath={inputPath}
          outputPath={outputPath}
          startTime={startTime}
          endTime={endTime}
          loading={loading}
          onInputChange={setInputPath}
          onOutputChange={setOutputPath}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
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