import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PropertiesSidebarProps {
  // state
  inputPath: string;
  outputPath: string;
  startTime: string;
  endTime: string;
  loading: boolean;

  // Handlers for text input changes
  onInputChange: (path: string) => void;
  onOutputChange: (path: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;

  // button handlers
  onPickInput: () => void;
  onPickOutput: () => void;
  onTrim: () => void;
}

export function PropertiesSidebar({
  inputPath,
  outputPath,
  startTime,
  endTime,
  loading,
  onInputChange,
  onOutputChange,
  onStartTimeChange,
  onEndTimeChange,
  onPickInput,
  onPickOutput,
  onTrim,
}: PropertiesSidebarProps) {
  return (
    <aside className="w-72 flex-shrink-0 border-l border-border overflow-y-auto">
      <div className="p-4 space-y-2 border-b border-border">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Vídeo de entrada
        </h2>
        <div className="space-y-2">
          <Input
            value={inputPath}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Ningún vídeo seleccionado"
            className="text-xs"
            title={inputPath}
          />
          <Button variant="secondary" size="sm" className="w-full" onClick={onPickInput}>
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
            onChange={(e) => onOutputChange(e.target.value)}
            placeholder="Ningún destino seleccionado"
            className="text-xs"
            title={outputPath}
          />
          <Button variant="secondary" size="sm" className="w-full" onClick={onPickOutput}>
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
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Fin</label>
            <Input
              type="text"
              placeholder="00:00:10"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <Button onClick={onTrim} disabled={loading} className="w-full">
          {loading ? "Procesando..." : "Recortar Vídeo"}
        </Button>
      </div>
    </aside>
  );
}