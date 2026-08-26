import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import type { QueueItem } from "../types/queue";
import { formatDuration } from "./QueueCard";

interface VideoInfoDialogProps {
  item: QueueItem | null;
  onOpenChange: (open: boolean) => void;
}

const rows = (item: QueueItem) => [
  { label: "Duración", value: formatDuration(item.durationSec) },
  {
    label: "Resolución",
    value:
      item.details?.width && item.details?.height
        ? `${item.details.width}×${item.details.height}`
        : "-",
  },
  { label: "FPS", value: item.details?.fps ? Math.round(item.details.fps) : "-" },
  { label: "Códec", value: item.details?.codec ?? "-" },
  {
    label: "Tamaño",
    value: item.details?.sizeBytes ? `${(item.details.sizeBytes / 1_000_000).toFixed(1)} MB` : "-",
  },
];

export function VideoInfoDialog({ item, onOpenChange }: VideoInfoDialogProps) {
  return (
    <Dialog.Root open={item !== null} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/90" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[min(30rem,90vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-border bg-popover text-popover-foreground">
          {item && (
            <>
              <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
                <Dialog.Title className="break-words text-base font-medium">
                  {item.fileName}
                </Dialog.Title>
                <Dialog.Close className="shrink-0 text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">
                Información técnica de {item.fileName}
              </Dialog.Description>

              <dl>
                {rows(item).map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between border-t border-border px-6 py-2 text-sm"
                  >
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-border px-6 pt-4 pb-6">
                <p className="text-xs text-muted-foreground">Ruta</p>
                <p className="mt-1 break-all text-sm">{item.inputPath}</p>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}