import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  enabled: boolean;
  onShowInfo: () => void;
  onPreviousItem: () => void;
  onNextItem: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function isInsideOverlay(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  return target.closest('[role="dialog"], [role="alertdialog"], [role="menu"]') !== null;
}

export function useKeyboardShortcuts({
  enabled,
  onShowInfo,
  onPreviousItem,
  onNextItem,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        isTypingTarget(event.target) ||
        isInsideOverlay(event.target)
      ) {
        return;
      }

      if (
        event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.metaKey &&
        event.key.toLowerCase() === "i"
      ) {
        event.preventDefault();
        onShowInfo();
        return;
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onPreviousItem();
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          onNextItem();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onShowInfo, onPreviousItem, onNextItem]);
}
