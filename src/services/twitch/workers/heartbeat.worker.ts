/**
 * Изолированный Web Worker для ведения точных фоновых таймеров.
 */
import { TWITCH_HEARTBEAT_WORKER_COMMANDS, TWITCH_HEARTBEAT_WORKER_EVENTS } from '../../../constants/twitch.constants.ts'

let pingTimeoutId: ReturnType<typeof setTimeout> | null = null
let pongTimeoutId: ReturnType<typeof setTimeout> | null = null

/**
 * Сбрасывает все активные таймеры воркера.
 */
const clearAllTimers = (): void => {
  if (pingTimeoutId) {
    clearTimeout(pingTimeoutId)
    pingTimeoutId = null
  }
  if (pongTimeoutId) {
    clearTimeout(pongTimeoutId)
    pongTimeoutId = null
  }
}

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data

  switch (type) {
    // Инициализация или сброс таймера контроля тишины чата
    case TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PING_TIMER: {
      clearAllTimers()

      const interval = payload || 60000

      pingTimeoutId = setTimeout(() => {
        self.postMessage({ type: TWITCH_HEARTBEAT_WORKER_EVENTS.PING_TICK })
      }, interval)
      break
    }

    // Запуск таймера ожидания ответа PONG от сервера
    case TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PONG_TIMER: {
      clearAllTimers()

      const timeout = payload || 10000

      pongTimeoutId = setTimeout(() => {
        self.postMessage({ type: TWITCH_HEARTBEAT_WORKER_EVENTS.PONG_TIMEOUT })
      }, timeout)
      break
    }

    // Снятие таймера ожидания при успешном получении PONG
    case TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_PONG_TIMER: {
      if (pongTimeoutId) {
        clearTimeout(pongTimeoutId)
        pongTimeoutId = null
      }
      break
    }

    // Полная остановка всех фоновых таймеров
    case TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_ALL: {
      clearAllTimers()
      break
    }
  }
}
