import { arrayMove } from "@dnd-kit/sortable";
import { useReducer, useCallback, useMemo, useState } from 'react';
import type { QueueItem, QueueItemStatus } from '../types/queue';

interface QueueState {
  items: QueueItem[];
  selectedId: string | null;
  processingItemId: string | null;
}

type QueueAction =
  | { type: 'ADD_ITEMS'; items: QueueItem[] }
  | { type: 'SELECT_ITEM'; id: string }
  | { type: 'SELECT_RELATIVE'; delta: -1 | 1 }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'CLEAR_QUEUE_EXCEPT_PROCESSING' }
  | { type: 'UPDATE_ITEM'; id: string; patch: Partial<QueueItem> }
  | { type: 'SET_STATUS'; id: string; status: QueueItemStatus; errorMessage?: string }
  | { type: 'SET_PROCESSING'; id: string | null }
  | { type: "REORDER_ITEMS"; oldIndex: number; newIndex: number };

const initialState: QueueState = {
  items: [],
  selectedId: null,
  processingItemId: null,
};

function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'ADD_ITEMS': {
      const items = [...state.items, ...action.items];
      const selectedId = state.selectedId ?? action.items[0]?.id ?? null;
      return { ...state, items, selectedId };
    }

    case 'SELECT_ITEM':
      return { ...state, selectedId: action.id };

    case 'SELECT_RELATIVE': {
      if (state.items.length === 0) return state;

      if (state.selectedId === null) {
        const index = action.delta > 0 ? 0 : state.items.length - 1;
        return { ...state, selectedId: state.items[index].id };
      }

      const currentIndex = state.items.findIndex((item) => item.id === state.selectedId);
      if (currentIndex === -1) return state;

      const nextIndex = (currentIndex + action.delta + state.items.length) % state.items.length;
      return { ...state, selectedId: state.items[nextIndex].id };
    }

    case 'REMOVE_ITEM': {
      const removedIndex = state.items.findIndex((item) => item.id === action.id);
      const items = state.items.filter((item) => item.id !== action.id);
      let selectedId = state.selectedId;
      if (state.selectedId === action.id) {
        const nextItem = items[removedIndex] ?? items[removedIndex - 1];
        selectedId = nextItem?.id ?? null;
      }
      return { ...state, items, selectedId };
    }

    case 'CLEAR_QUEUE_EXCEPT_PROCESSING': {
      const items = state.items.filter((item) => item.id === state.processingItemId);
      const selectedId = items.some((item) => item.id === state.selectedId)
        ? state.selectedId
        : items[0]?.id ?? null;
      return { ...state, items, selectedId };
    }

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.patch } : item
        ),
      };

    case 'SET_STATUS':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, status: action.status, errorMessage: action.errorMessage }
            : item
        ),
      };

    case 'SET_PROCESSING':
      return { ...state, processingItemId: action.id };

    case "REORDER_ITEMS":
      return {
        ...state,
        items: arrayMove(state.items, action.oldIndex, action.newIndex),
      };

    default:
      return state;
  }
}

export function useVideoQueue() {
  const [state, dispatch] = useReducer(queueReducer, initialState);
  const [isAddingFiles, setIsAddingFiles] = useState(false);

  const selectedItem = useMemo(
    () => state.items.find((item) => item.id === state.selectedId) ?? null,
    [state.items, state.selectedId]
  );

  const addItems = useCallback(
    (items: QueueItem[]) => dispatch({ type: 'ADD_ITEMS', items }),
    []
  );
  const selectItem = useCallback((id: string) => dispatch({ type: 'SELECT_ITEM', id }), []);
  const selectRelative = useCallback(
    (delta: -1 | 1) => dispatch({ type: 'SELECT_RELATIVE', delta }),
    []
  );
  const removeItem = useCallback((id: string) => dispatch({ type: 'REMOVE_ITEM', id }), []);
  const clearQueueExceptProcessing = useCallback(
    () => dispatch({ type: 'CLEAR_QUEUE_EXCEPT_PROCESSING' }),
    []
  );
  const updateItem = useCallback(
    (id: string, patch: Partial<QueueItem>) => dispatch({ type: 'UPDATE_ITEM', id, patch }),
    []
  );
  const setStatus = useCallback(
    (id: string, status: QueueItemStatus, errorMessage?: string) =>
      dispatch({ type: 'SET_STATUS', id, status, errorMessage }),
    []
  );
  const setProcessing = useCallback(
    (id: string | null) => dispatch({ type: 'SET_PROCESSING', id }),
    []
  );
  const reorderItems = useCallback(
    (oldIndex: number, newIndex: number) => dispatch({ type: 'REORDER_ITEMS', oldIndex, newIndex }),
    []
  );

  return {
    items: state.items,
    selectedId: state.selectedId,
    selectedItem,
    processingItemId: state.processingItemId,
    addItems,
    selectItem,
    selectRelative,
    removeItem,
    clearQueueExceptProcessing,
    updateItem,
    setStatus,
    setProcessing,
    isAddingFiles,
    setIsAddingFiles,
    reorderItems,
  };
}