import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { QueueSetState, QueueState } from '../types.ts'
import { QUEUE_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { readStoredValue, serializeStoredValue } from '../../../hooks/utils/storage.utils.ts'
import { readWebStorage, writeWebStorage } from '../../../hooks/utils/webStorage.utils.ts'
import { createInitialState, sanitizeQueueState } from '../utils/queueState.utils.ts'
import { createQueueStore, type QueueStore } from '../store/queueStore.ts'

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
  const isFirstRunRef = useRef(true)

  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)

  useEffect(() => {
    const serialized = serializeStoredValue('localStorage', QUEUE_STORAGE_KEYS.DATA, state)
    const { value: item } = readWebStorage('localStorage', QUEUE_STORAGE_KEYS.DATA)
    const isFirstRun = isFirstRunRef.current
    isFirstRunRef.current = false

    // Не создаём запись на монтировании и не перезаписываем одинаковое значение.
    if (serialized === null || (isFirstRun && item === null) || item === serialized) return

    writeWebStorage('localStorage', QUEUE_STORAGE_KEYS.DATA, serialized)
  }, [state])

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
