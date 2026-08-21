import { X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContextMenu } from "radix-ui";
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

const STATUS_STYLE: Record<QueueItem["status"], string> = {
  pending: "text-muted-foreground",
  processing: "text-primary",
  completed: "text-green-500",
  error: "text-destructive",
}

interface QueueCardProps {
  item: QueueItem;
  isSelected: boolean;
  isProcessing: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveToStart: () => void;
  onMoveToEnd: () => void;
}

export function QueueCard({
  item,
  isSelected,
  isProcessing,
  onSelect,
  onRemove,
  onMoveToStart,
  onMoveToEnd,
}: QueueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isProcessing });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          ref={setNodeRef}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
            zIndex: isDragging ? 10 : undefined,
          }}
          {...attributes}
          {...listeners}
          onClick={() => onSelect(item.id)}
          className={cn(
            "group relative cursor-grab overflow-hidden border bg-background transition-colors duration-200 active:cursor-grabbing",
            isProcessing && "cursor-default opacity-70",
            isSelected
              ? "border-primary"
              : "border-border hover:border-muted-foreground hover:bg-muted/20"
          )}
        >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
            Sin miniatura.
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-background via-background/90 to-transparent" />

        <button
          onPointerDown={(event) => event.stopPropagation()}
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

          <div className="mt-1 flex justify-between gap-2 text-[12px] text-muted-foreground">
            <span className="font-mono">{formatDuration(item.durationSec)}</span>
            <span className={STATUS_STYLE[item.status]}>{STATUS_LABEL[item.status]}</span>
          </div>
        </div>
      </div>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-40 border border-border bg-popover p-1 text-popover-foreground">
          <ContextMenu.Item
            disabled={isProcessing}
            onSelect={onMoveToStart}
            className="cursor-default px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent"
          >
            Mover al principio
          </ContextMenu.Item>
          <ContextMenu.Item
            disabled={isProcessing}
            onSelect={onMoveToEnd}
            className="cursor-default px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent"
          >
            Mover al final
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}