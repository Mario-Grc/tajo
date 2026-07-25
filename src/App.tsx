import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import {toast } from "sonner";

function App() {
  const [inputPath, setInputPath] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");
  const [loading, setLoading] = useState(false);

  const handleTrim = async () => {
    if (!inputPath) {
      toast.error("Por favor, ingresa la ruta del vídeo.");
      return;
    }

    setLoading(true);
    const toastId = toast.info("Procesando recorte...");

    try {
      const result = await invoke<string>("run_trim", {
        start: startTime,
        end: endTime,
        input: inputPath,
        output: null,
      });

      toast.success(`Recorte completado. Guardado en: ${result}`, { id: toastId });
    } catch (error) {
      toast.error(`Error: ${error}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground select-none">
      {/* Header */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between border-b border-border px-4">
        <Button variant="secondary" size="sm" >Cola</Button>
      </header>

      {/* zona principal con 3 columnas */}
      <div className="flex flex-1 overflow-hidden">
        {/* panel para la cola*/}
        <aside className="w-64 flex-shrink-0 border-r border-border p-3 overflow-y-auto">
          <p className="text-xs text-muted-foreground">
            {/* TODO hacer la cola*/}
            Sin vídeos en la cola
          </p>
        </aside>

      {/* zona central */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="max-w-md w-full space-y-6 border border-border bg-card p-6 rounded-none">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Aquí estaría la previsualización del vídeo
              </h1>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Ruta del vídeo:</label>
                <Input
                  type="text"
                  placeholder="C:\videos\partida.mp4"
                  value={inputPath}
                  onChange={(e) => setInputPath(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs text-muted-foreground">Inicio:</label>
                  <Input
                    type="text"
                    placeholder="00:00:00"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="text-xs text-muted-foreground">Fin:</label>
                  <Input
                    type="text"
                    placeholder="00:00:10"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <Button onClick={handleTrim} disabled={loading} className="w-full">
                {loading ? "Procesando..." : "Recortar Vídeo"}
              </Button>
            </div>
          </div>
        </main>

        {/* Panel opciones de la operación activa */}
        <aside className="w-64 flex-shrink-0 border-l border-border p-3 overflow-y-auto">
          <p className="text-xs text-muted-foreground">
            {/* TODO: panel de opciones */}
            Aquí irán las opciones y ajustes
          </p>
        </aside>
      </div>

      {/* Footer timeline */}
      <footer className="h-20 flex-shrink-0 border-t border-border p-3">
        <p className="text-xs text-muted-foreground">
          {/* TODO: timeline + marcas In/Out */}
          Timeline
        </p>
      </footer>

      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;
