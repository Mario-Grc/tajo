import { Loader2, PanelLeftClose, PanelLeftOpen, Trash2 } from "lucide-react";
import {VideoInfoDialog} from "./VideoInfoDialog";
import { useState } from "react";
import type { QueueItem } from "../types/queue";
import { QueueCard } from "./QueueCard";
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
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface QueueSidebarProps {
  items: QueueItem[];
  selectedId: string | null;
  processingItemId: string | null;
  isAddingFiles: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClearQueue: () => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

export function QueueSidebar({ items, selectedId, processingItemId, isAddingFiles, onSelect, onRemove, onClearQueue, onReorder }: QueueSidebarProps) {
  const [showQueue, setShowQueue] = useState(true);
  const [infoItem, setInfoItem] = useState<QueueItem | null>(null);
  const queueCount = items.length;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(oldIndex, newIndex);
  }

  function moveItemToEdge(id: string, edge: "start" | "end") {
    const currentIndex = items.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    const targetIndex = edge === "start" ? 0 : items.length - 1;
    if (currentIndex !== targetIndex) onReorder(currentIndex, targetIndex);
  }

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
          <span className="text-sm leading-none text-muted-foreground w-full h-6 flex items-center justify-center">
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
          Cola {queueCount > 0 && `(${queueCount})`}
        </h2>
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={items.length === 0 || items.every((item) => item.id === processingItemId)}
                className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                title="Vaciar cola excepto el vídeo en ejecución"
                aria-label="Vaciar cola excepto el vídeo en ejecución"
              >
                <Trash2 className="size-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Vaciar cola?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminarán de la cola todos los vídeos que no se estén procesando.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onClearQueue}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button
            onClick={() => setShowQueue(false)}
            className="text-muted-foreground hover:text-foreground"
            title="Ocultar cola"
            >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground m-3">Sin vídeos en cola.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              autoScroll={false}
              modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <QueueCard
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedId}
                    isProcessing={item.id === processingItemId}
                    onSelect={onSelect}
                    onRemove={onRemove}
                    onMoveToStart={() => moveItemToEdge(item.id, "start")}
                    onMoveToEnd={() => moveItemToEdge(item.id, "end")}
                    onShowInfo={setInfoItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {isAddingFiles && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80 backdrop-blur-xs">
            <Loader2 className="size-10 animate-spin" />
          </div>
        )}
      </div>
      <VideoInfoDialog item={infoItem} onOpenChange={(open) => !open && setInfoItem(null)} />
    </aside>
  );
}