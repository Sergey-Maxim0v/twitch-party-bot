import type { QueueState } from '../types.ts'

/** Новое состояние очереди или функция его вычисления из предыдущего. */
export type QueueStateUpdater = QueueState | ((prev: QueueState) => QueueState)

/**
 * Синхронное хранилище состояния очереди.
 *
 * Обновление применяется сразу в момент вызова `setState`, поэтому результат
 * операции известен сразу и не зависит от порядка рендера React.
 */
export interface QueueStore {
  /** Возвращает актуальное состояние очереди. */
  getState: () => QueueState;
  /** Применяет обновление и уведомляет подписчиков. */
  setState: (updater: QueueStateUpdater) => void;
  /** Подписывает слушателя на изменения состояния. */
  subscribe: (listener: () => void) => () => void;
}

/**
 * Создаёт хранилище состояния очереди с начальным значением.
 *
 * @param initialState - Состояние очереди до первого обновления.
 * @returns Хранилище состояния очереди.
 */
export const createQueueStore = (initialState: QueueState): QueueStore => {
  let state = initialState
  const listeners = new Set<() => void>()

  return {
    getState: () => state,

    setState: updater => {
      const nextState = typeof updater === 'function' ? updater(state) : updater

      if (Object.is(nextState, state)) return

      state = nextState
      listeners.forEach(listener => listener())
    },

    subscribe: listener => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}
