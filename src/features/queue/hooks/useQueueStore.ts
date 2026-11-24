import { useEffect, useState, useSyncExternalStore } from 'react'
import type { QueueSetState, QueueState } from '../types.ts'
import { QUEUE_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { readStoredValue } from '../../../hooks/utils/storage.utils.ts'
import { createInitialState, sanitizeQueueState } from '../utils/queueState.utils.ts'
import { createQueueStore, type QueueStore } from '../store/queueStore.ts'
import { useStorageWrite } from '../../../hooks/useStorageWrite.ts'

interface UseQueueStoreResult {
  /** Актуальное состояние очереди. */
  state: QueueState;
  /** Обновляет состояние очереди. */
  setState: QueueSetState;
  /** Читает актуальное состояние очереди без подписки на изменения. */
  getState: () => QueueState;
}

/** Читает состояние очереди из localStorage, отбрасывая повреждённые записи. */
const readStoredState = (): QueueState => (
  sanitizeQueueState(readStoredValue('localStorage', QUEUE_STORAGE_KEYS.DATA, createInitialState()))
)

/** Хранит состояние очереди в localStorage и синхронизирует его между вкладками. */
export const useQueueStore = (): UseQueueStoreResult => {
  const [store] = useState<QueueStore>(() => createQueueStore(readStoredState()))

  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)

  useStorageWrite(QUEUE_STORAGE_KEYS.DATA, state)

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key !== QUEUE_STORAGE_KEYS.DATA) return

      store.setState(readStoredState())
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [store])

  return { state, setState: store.setState, getState: store.getState }
}
