import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import type { QueueItem } from "../types/queue";
import { useEffect, useState } from "react";

function formatTimecode(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "";

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function parseTimecode(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return null;

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

  return null;
}

function sanitizeTimecodeInput(value: string): string {
  return value.replace(/[^0-9:]/g, "");
}

interface PropertiesSidebarProps {
  item: QueueItem | null;
  isProcessing: boolean;
  onPickInput: () => void;
  onPickOutput: () => void;
  onTrim: () => void;
  onDeleteVideo: () => void;
  onInputChange: (path: string) => void;
  onOutputChange: (path: string) => void;
  onStartTimeChange: (time: number | null) => void;
  onEndTimeChange: (time: number | null) => void;
}

export function PropertiesSidebar({
  item,
  isProcessing,
  onPickInput,
  onPickOutput,
  onTrim,
  onDeleteVideo,
  onInputChange,
  onOutputChange,
  onStartTimeChange,
  onEndTimeChange,
}: PropertiesSidebarProps) {
  const hasSelection = item !== null;
  const [startDraft, setStartDraft] = useState("");
  const [endDraft, setEndDraft] = useState("");

  useEffect(() => {
    setStartDraft(formatTimecode(item?.startTime ?? null));
    setEndDraft(formatTimecode(item?.endTime ?? null));
  }, [item?.id, item?.startTime, item?.endTime]);

  const commitStartTime = () => {
    onStartTimeChange(parseTimecode(startDraft));
  };

  const commitEndTime = () => {
    onEndTimeChange(parseTimecode(endDraft));
  };

  const inputPath = item?.inputPath ?? "";
  const outputPath = item?.outputPath ?? "";

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
            disabled={!hasSelection}
          />
          <Button variant="secondary" size="sm" className="w-full" onClick={onPickInput}>
            Seleccionar vídeo
          </Button>
          {/* botón para eliminar el vídeo, abre un alertdialog de shadcn*/}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full" disabled={!hasSelection || isProcessing}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Vídeo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar vídeo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se moverá a la papelera del sistema. Podrás recuperarlo desde ahí si cambias de idea.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onDeleteVideo} 
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
            disabled={!hasSelection}
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
              value={startDraft}
              onChange={(e) => setStartDraft(sanitizeTimecodeInput(e.target.value))}
              onBlur={commitStartTime}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitStartTime();
              }}
              className="font-mono text-xs"
              disabled={!hasSelection}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Fin</label>
            <Input
              type="text"
              placeholder="00:00:10"
              value={endDraft}
              onChange={(e) => setEndDraft(sanitizeTimecodeInput(e.target.value))}
              onBlur={commitEndTime}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEndTime();
              }}
              className="font-mono text-xs"
              disabled={!hasSelection}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <Button onClick={onTrim} disabled={!hasSelection || isProcessing} className="w-full">
          {isProcessing ? "Procesando..." : "Recortar Vídeo"}
        </Button>
      </div>
    </aside>
  );
}