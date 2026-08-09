import { X } from "lucide-react";
import type { QueueItem } from "../types/queue";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "--:--:--";

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

const STATUS_LABEL: Record<QueueItem["status"], string> = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  error: "Error",
};

interface QueueCardProps {
  item: QueueItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function QueueCard({ item, isSelected, onSelect, onRemove }: QueueCardProps) {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex cursor-pointer items-center gap-3 border p-2 transition-colors",
        isSelected ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted/40"
      )}
    >
      <div className="flex h-12 w-20 flex-shrink-0 overflow-hidden bg-muted">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wide text-muted-foreground">
            Sin miniatura
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{item.fileName}</p>
        <p className="font-mono text-xs text-muted-foreground">{formatDuration(item.durationSec)}</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{STATUS_LABEL[item.status]}</p>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onRemove(item.id);
        }}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Eliminar de la cola"
        title="Eliminar de la cola"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}