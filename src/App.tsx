import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { dirname, join } from "@tauri-apps/api/path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { VideoPlayer } from "./components/VideoPlayer";

const VIDEO_EXTENSIONS = ["mp4", "mov", "mkv", "avi", "webm", "m4v", "wmv", "flv"];

function truncate(text: string, max = 180) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// A partir de la ruta de entrada, calcula una ruta de salida por defecto.
// misma carpeta que el original, con sufijo "_recortado"
async function computeDefaultOutputPath(inputPath: string): Promise<string> {
  const dir = await dirname(inputPath);
  const fullName = inputPath.split(/[\\/]/).pop() ?? "output.mp4";
  const dotIndex = fullName.lastIndexOf(".");
  const nameWithoutExt = dotIndex > 0 ? fullName.slice(0, dotIndex) : fullName;
  const ext = dotIndex > 0 ? fullName.slice(dotIndex) : "";
  return join(dir, `${nameWithoutExt}_recortado${ext}`);
}

function App() {
  const [inputPath, setInputPath] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");
  const [loading, setLoading] = useState(false);
  const [showQueue, setShowQueue] = useState(true);

  const queueCount = 0; // TODO: contar vídeos en cola

  const handlePickInput = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Vídeos", extensions: VIDEO_EXTENSIONS }],
    });

    if (typeof selected === "string") {
      setInputPath(selected);
      // Autocompletar la salida por defecto (misma carpeta, sufijo _recortado)
      const defaultOut = await computeDefaultOutputPath(selected);
      setOutputPath(defaultOut);
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
      toast.error(truncate(`Error: ${error}`), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground select-none">
      {/* Header */}
      <header className="h-10 flex-shrink-0 flex items-center justify-start border-b border-border px-4">

      </header>

      {/* zona principal con 3 columnas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel izquierdo: cola de vídeos */}
        {showQueue ? (
          <aside className="w-64 flex-shrink-0 border-r border-border flex flex-col overflow-y-auto">
            <div className="h-10 flex-shrink-0 flex items-center justify-between border-b border-border px-3">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cola
              </h2>
              <button
                onClick={() => setShowQueue(false)}
                className="text-muted-foreground hover:text-foreground"
                title="Ocultar cola"
              >
                <PanelLeftClose className="size-4" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground">
                {/* TODO: cola de vídeos */}
                Sin vídeos en cola
              </p>
            </div>
          </aside>
        ) : (
          <aside className="w-10 flex-shrink-0 border-r border-border flex flex-col items-center pt-2 gap-1">
            <button
              onClick={() => setShowQueue(true)}
              className="text-muted-foreground hover:text-foreground p-1.5"
              title="Mostrar cola"
            >
              <PanelLeftOpen className="size-4" />
            </button>
            {queueCount > 0 && (
              <span className="text-[10px] leading-none bg-secondary text-foreground rounded-full size-4 flex items-center justify-center">
                {queueCount}
              </span>
            )}
          </aside>
        )}

        {/* Zona central */}
        <main className="flex-1 flex items-center justify-center overflow-y-auto">
          {inputPath ? (
            <VideoPlayer key={inputPath} inputPath={inputPath}/>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecciona un vídeo para comenzar.
            </p>
          )}
        </main>

        {/* Panel derecho: opciones*/}
        <aside className="w-72 flex-shrink-0 border-l border-border overflow-y-auto">
          <div className="p-4 space-y-2 border-b border-border">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Vídeo de entrada
            </h2>
            <div className="space-y-2">
              <Input
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                placeholder="Ningún vídeo seleccionado"
                className="text-xs"
                title={inputPath}
              />
              <Button variant="secondary" size="sm" className="w-full" onClick={handlePickInput}>
                Seleccionar vídeo
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-2 border-b border-border">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Guardar como
            </h2>
            <div className="space-y-2">
              <Input
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                placeholder="Ningún destino seleccionado"
                className="text-xs"
                title={outputPath}
              />
              <Button variant="secondary" size="sm" className="w-full" onClick={handlePickOutput}>
                Elegir destino
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-2 border-b border-border">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Rango de recorte
            </h2>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Inicio</label>
                <Input
                  type="text"
                  placeholder="00:00:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Fin</label>
                <Input
                  type="text"
                  placeholder="00:00:10"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="p-4">
            <Button onClick={handleTrim} disabled={loading} className="w-full">
              {loading ? "Procesando..." : "Recortar Vídeo"}
            </Button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="h-24 flex-shrink-0 border-t border-border p-3">
        <p className="text-xs text-muted-foreground">
          {/* TODO: timeline*/}
          Timeline
        </p>
      </footer>

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