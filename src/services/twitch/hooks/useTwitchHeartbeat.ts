import { useEffect, useRef, useCallback } from 'react'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import { SOCKET_CONNECTION_STATUSES } from '../../socket/types.ts'
import {
  TWITCH_HEARTBEAT_WORKER_COMMANDS,
  TWITCH_HEARTBEAT_WORKER_EVENTS,
  TWITCH_IRC_COMMANDS,
  TWITCH_PING_MESSAGE,
} from '../../../constants/twitch.constants.ts'

import HeartbeatWorker from '../workers/heartbeat.worker.ts?worker'

/**
 * Контроль «полуоткрытого» соединения: PING отправляется только после периода тишины.
 */
export const useTwitchHeartbeat = () => {
  const socketContext = useSocketContext()
  const connectionStatus = socketContext?.connectionStatus

  const workerRef = useRef<Worker | null>(null)
  const connectionStatusRef = useRef(connectionStatus)

  useEffect(() => {
    connectionStatusRef.current = connectionStatus
  }, [connectionStatus])

  /**
   * Принудительно обрывает зависший сокет при отсутствии PONG.
   */
  const handleConnectionFailure = useCallback(() => {
    if (!socketContext) return

    workerRef.current?.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_ALL })

    const client = socketContext.getClient()
    if (client.isIntentionallyDisconnected) return

    client.forceCloseAndReconnect()
  }, [socketContext])

  /**
   * Отправляет PING и запускает ожидание PONG.
   */
  const sendPing = useCallback(() => {
    if (!socketContext || connectionStatusRef.current !== SOCKET_CONNECTION_STATUSES.CONNECTED) return

    socketContext.getClient().sendRaw(TWITCH_PING_MESSAGE)
    workerRef.current?.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PONG_TIMER })
  }, [socketContext])

  /**
   * Снимает ожидание PONG только по ответу сервера и перезапускает таймер тишины.
   */
  const handleSocketActivity = useCallback((command: string) => {
    if (connectionStatusRef.current !== SOCKET_CONNECTION_STATUSES.CONNECTED) return

    const worker = workerRef.current
    if (!worker) return

    if (command === TWITCH_IRC_COMMANDS.PONG) {
      worker.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_PONG_TIMER })
    }

    worker.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PING_TIMER })
  }, [])

  const sendPingRef = useRef(sendPing)
  const handleConnectionFailureRef = useRef(handleConnectionFailure)

  useEffect(() => {
    sendPingRef.current = sendPing
    handleConnectionFailureRef.current = handleConnectionFailure
  }, [sendPing, handleConnectionFailure])

  useEffect(() => {
    const worker = new HeartbeatWorker()
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent) => {
      const { type } = event.data

      if (type === TWITCH_HEARTBEAT_WORKER_EVENTS.PING_TICK) {
        sendPingRef.current()
      } else if (type === TWITCH_HEARTBEAT_WORKER_EVENTS.PONG_TIMEOUT) {
        handleConnectionFailureRef.current()
      }
    }

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  // Таймеры синхронизируются только с фактической сменой статуса соединения
  useEffect(() => {
    const worker = workerRef.current
    if (!worker) return

    if (connectionStatus === SOCKET_CONNECTION_STATUSES.CONNECTED) {
      worker.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PING_TIMER })
      return
    }

    if (connectionStatus === SOCKET_CONNECTION_STATUSES.DISCONNECTED) {
      worker.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_ALL })
    }
  }, [connectionStatus])

  return {
    handleSocketActivity,
  }
}
