/**
 * Фоновые таймеры heartbeat: опрос сокета после тишины и ожидание PONG.
 */
import {
  TWITCH_HEARTBEAT_INTERVAL_MS,
  TWITCH_HEARTBEAT_WORKER_COMMANDS,
  TWITCH_HEARTBEAT_WORKER_EVENTS,
  TWITCH_PONG_TIMEOUT_MS,
} from '../../../constants/twitch.constants.ts'

let pingTimeoutId: ReturnType<typeof setTimeout> | null = null
let pongTimeoutId: ReturnType<typeof setTimeout> | null = null

/**
 * Останавливает таймер контроля тишины сокета.
 */
const clearPingTimer = (): void => {
  if (pingTimeoutId === null) return

  clearTimeout(pingTimeoutId)
  pingTimeoutId = null
}

/**
 * Останавливает ожидание ответа PONG.
 */
const clearPongTimer = (): void => {
  if (pongTimeoutId === null) return

  clearTimeout(pongTimeoutId)
  pongTimeoutId = null
}

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data

  switch (type) {
    // Сокет проверяется только после периода тишины
    case TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PING_TIMER: {
      clearPingTimer()

      pingTimeoutId = setTimeout(() => {
        pingTimeoutId = null
        self.postMessage({ type: TWITCH_HEARTBEAT_WORKER_EVENTS.PING_TICK })
      }, payload || TWITCH_HEARTBEAT_INTERVAL_MS)
      break
    }

    // Ожидание PONG не зависит от таймера тишины
    case TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PONG_TIMER: {
      clearPongTimer()

      pongTimeoutId = setTimeout(() => {
        pongTimeoutId = null
        self.postMessage({ type: TWITCH_HEARTBEAT_WORKER_EVENTS.PONG_TIMEOUT })
      }, payload || TWITCH_PONG_TIMEOUT_MS)
      break
    }

    case TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_PONG_TIMER: {
      clearPongTimer()
      break
    }

    case TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_ALL: {
      clearPingTimer()
      clearPongTimer()
      break
    }
  }
}
