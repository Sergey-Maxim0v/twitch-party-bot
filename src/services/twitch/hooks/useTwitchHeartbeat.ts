import { useEffect, useRef, useCallback } from 'react'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import { SOCKET_CONNECTION_STATUSES } from '../../socket/types.ts'
import { TWITCH_HEARTBEAT_WORKER_COMMANDS, TWITCH_HEARTBEAT_WORKER_EVENTS, TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'

import HeartbeatWorker from '../workers/heartbeat.worker.ts?worker'

const TWITCH_HEARTBEAT_INTERVAL_MS = 60000
const PONG_TIMEOUT = 10000

/**
 * Изолированный хук для контроля «полуоткрытого» соединения (Heartbeat / Ping-Pong).
 */
export const useTwitchHeartbeat = () => {
  const socketContext = useSocketContext()
  const connectionStatus = socketContext?.connectionStatus

  const workerRef = useRef<Worker | null>(null)
  const connectionStatusRef = useRef(connectionStatus)

  useEffect(() => {
    connectionStatusRef.current = connectionStatus
  }, [connectionStatus])

  // Принудительный обрыв зависшего сокета при отсутствии PONG-ответа.
  const handleConnectionFailure = useCallback(() => {
    if (!socketContext) return

    workerRef.current?.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_ALL })

    const client = socketContext.getClient()
    client.forceCloseAndReconnect()
  }, [socketContext])

  // Отправка системного IRC-запроса PING на сервер Twitch.
  const sendPing = useCallback(() => {
    if (!socketContext || connectionStatusRef.current !== SOCKET_CONNECTION_STATUSES.CONNECTED) return

    const client = socketContext.getClient()

    client.sendRaw('PING :twitch_party_queue')

    workerRef.current?.postMessage({
      type: TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PONG_TIMER,
      payload: PONG_TIMEOUT,
    })
  }, [socketContext])

  /**
     * Сбрасывает таймер ожидания PONG при успехе и перезапускает таймер тишины.
     */
  const handleSocketActivity = useCallback((command: string) => {
    if (connectionStatusRef.current !== SOCKET_CONNECTION_STATUSES.CONNECTED || !workerRef.current) return

    if (command === TWITCH_IRC_COMMANDS.PONG) {
      workerRef.current.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_PONG_TIMER })
    }

    workerRef.current.postMessage({
      type: TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PING_TIMER,
      payload: TWITCH_HEARTBEAT_INTERVAL_MS,
    })
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

  // Безопасное управление состояниями таймеров воркера
  useEffect(() => {
    const currentWorker = workerRef.current
    if (!currentWorker) return

    if (connectionStatus === SOCKET_CONNECTION_STATUSES.CONNECTED) {
      currentWorker.postMessage({
        type: TWITCH_HEARTBEAT_WORKER_COMMANDS.START_PING_TIMER,
        payload: TWITCH_HEARTBEAT_INTERVAL_MS,
      })
    } else if (connectionStatus === SOCKET_CONNECTION_STATUSES.DISCONNECTED) {
      currentWorker.postMessage({ type: TWITCH_HEARTBEAT_WORKER_COMMANDS.CLEAR_ALL })
    }
  }, [connectionStatus, workerRef])

  return {
    handleSocketActivity,
  }
}
