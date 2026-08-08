import { useReducer, useCallback, useMemo } from 'react';
import type { QueueItem, QueueItemStatus } from '../types/queue';

interface QueueState {
  items: QueueItem[];
  selectedId: string | null;
  processingItemId: string | null;
}

type QueueAction =
  | { type: 'ADD_ITEMS'; items: QueueItem[] }
  | { type: 'SELECT_ITEM'; id: string }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_ITEM'; id: string; patch: Partial<QueueItem> }
  | { type: 'SET_STATUS'; id: string; status: QueueItemStatus; errorMessage?: string }
  | { type: 'SET_PROCESSING'; id: string | null };

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

    case 'REMOVE_ITEM': {
      const items = state.items.filter((item) => item.id !== action.id);
      let selectedId = state.selectedId;
      if (state.selectedId === action.id) {
        const nextPending = items.find((item) => item.status === 'pending');
        selectedId = nextPending?.id ?? items[0]?.id ?? null;
      }
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

    default:
      return state;
  }
}

export function useVideoQueue() {
  const [state, dispatch] = useReducer(queueReducer, initialState);

  const selectedItem = useMemo(
    () => state.items.find((item) => item.id === state.selectedId) ?? null,
    [state.items, state.selectedId]
  );

  const addItems = useCallback(
    (items: QueueItem[]) => dispatch({ type: 'ADD_ITEMS', items }),
    []
  );
  const selectItem = useCallback((id: string) => dispatch({ type: 'SELECT_ITEM', id }), []);
  const removeItem = useCallback((id: string) => dispatch({ type: 'REMOVE_ITEM', id }), []);
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

  return {
    items: state.items,
    selectedId: state.selectedId,
    selectedItem,
    processingItemId: state.processingItemId,
    addItems,
    selectItem,
    removeItem,
    updateItem,
    setStatus,
    setProcessing,
  };
}