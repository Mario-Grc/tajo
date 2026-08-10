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
        "group relative cursor-pointer overflow-hidden border bg-background transition-all duration-200",
        isSelected
          ? "border-primary"
          : "border-border hover:border-muted-foreground hover:bg-muted/20"
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Sin miniatura
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-background via-background/90 to-transparent" />

        <button
          onClick={(event) => {
            event.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute right-2 top-2 flex size-6 items-center justify-center border border-border bg-background/50 text-muted-foreground opacity-0 backdrop-blur-sm transition-all hover:border-destructive/60 hover:text-destructive group-hover:opacity-100"
          aria-label="Eliminar de la cola"
          title="Eliminar de la cola"
        >
          <X className="size-4" />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-sm font-medium text-foreground">
            {item.fileName}
          </p>

          <div className="mt-1 flex justify-between gap-2 font-mono text-[11px] text-muted-foreground">
            <span>{formatDuration(item.durationSec)}</span>
            <span>{STATUS_LABEL[item.status]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}