import { Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import type { QueueItem } from "../types/queue";
import { QueueCard } from "./QueueCard";

interface QueueSidebarProps {
  items: QueueItem[];
  selectedId: string | null;
  isAddingFiles: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function QueueSidebar({ items, selectedId, isAddingFiles, onSelect, onRemove }: QueueSidebarProps) {
  const [showQueue, setShowQueue] = useState(true);
  const queueCount = items.length;

  if (!showQueue) {
    return (
      <aside className="w-10 flex-shrink-0 border-r border-border flex flex-col items-center pt-2 gap-1">
        <button
          onClick={() => setShowQueue(true)}
          className="text-muted-foreground hover:text-foreground p-1.5"
          title="Mostrar cola"
        >
          <PanelLeftOpen className="size-4" />
        </button>
        {queueCount > 0 && (
          <span className="text-xs leading-none bg-secondary text-foreground size-5 flex items-center justify-center">
            {queueCount}
          </span>
        )}
      </aside>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
      <div className="h-10 flex-shrink-0 flex items-center justify-between border-b border-border px-3">
        <h2 className="text-sm tracking-wide text-muted-foreground">
          Cola
        </h2>
        {queueCount > 0 && (
          <span className="text-xs leading-none bg-secondary text-foreground size-5 flex items-center justify-center">
            {queueCount}
          </span>
        )}
        <button
          onClick={() => setShowQueue(false)}
          className="text-muted-foreground hover:text-foreground"
          title="Ocultar cola"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground m-3">Sin vídeos en cola.</p>
          ) : (
            items.map((item) => (
              <QueueCard
                key={item.id}
                item={item}
                isSelected={item.id === selectedId}
                onSelect={onSelect}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        {isAddingFiles && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80 backdrop-blur-xs">
            <Loader2 className="size-10 animate-spin" />
          </div>
        )}
      </div>
    </aside>
  );
}