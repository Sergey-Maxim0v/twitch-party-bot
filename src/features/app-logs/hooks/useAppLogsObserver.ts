import { useCallback, useEffect, useRef } from 'react'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { useAppLogs } from './useAppLogs.ts'
import { APP_LOG_STATUSES, APP_LOG_SOURCES, type AppLogItem } from '../types.ts'
import {
  SOCKET_CONNECTION_STATUSES,
  SOCKET_FAILURE_LOG_MESSAGES,
  SOCKET_FAILURE_REASONS,
  SOCKET_RECONNECT_MAX_ATTEMPTS,
  TWITCH_CHAT_ACCESS_STATUSES,
  type ChatAccessStatus,
  type ConnectionStatus,
  type SocketFailureReason,
} from '../../../services/socket/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'

/** Запись журнала о системном событии. */
type SystemLogEntry = Pick<AppLogItem, 'message' | 'status'>

/** Состояние соединения, о котором формируется запись журнала. */
interface ConnectionLogContext {
  status: ConnectionStatus;
  channel: string | null;
  reconnectAttempts: number | null;
  failureReason: SocketFailureReason | null;
  isIntentionallyDisconnected: boolean;
}

/**
 * Формирует запись журнала о состоянии соединения с Twitch.
 *
 * @returns Запись журнала или `null`, если для статуса нет сообщения.
 */
const getConnectionLogEntry = ({
  status,
  channel,
  reconnectAttempts,
  failureReason,
  isIntentionallyDisconnected,
}: ConnectionLogContext): SystemLogEntry | null => {
  const targetChannel = channel ? `@${channel}` : 'Twitch'

  if (status === SOCKET_CONNECTION_STATUSES.CONNECTING) {
    const attempts = reconnectAttempts ?? 0

    return {
      message: attempts > 0
        ? `Повторная попытка подключения к каналу ${targetChannel} (№${attempts})...`
        : `Подключение к каналу ${targetChannel}...`,
      status: APP_LOG_STATUSES.SUCCESS,
    }
  }

  if (status === SOCKET_CONNECTION_STATUSES.CONNECTED) {
    return {
      message: `Подключение к каналу ${targetChannel} установлено.`,
      status: APP_LOG_STATUSES.SUCCESS,
    }
  }

  if (status === SOCKET_CONNECTION_STATUSES.FAILED) {
    const attempts = reconnectAttempts ?? SOCKET_RECONNECT_MAX_ATTEMPTS

    return {
      message: failureReason === SOCKET_FAILURE_REASONS.AUTH
        ? SOCKET_FAILURE_LOG_MESSAGES.AUTH
        : SOCKET_FAILURE_LOG_MESSAGES.LIMIT(attempts),
      status: APP_LOG_STATUSES.ERROR,
    }
  }

  if (status === SOCKET_CONNECTION_STATUSES.DISCONNECTED) {
    return {
      message: isIntentionallyDisconnected
        ? `Соединение с каналом ${targetChannel} закрыто пользователем.`
        : 'Соединение с Twitch потеряно. Запуск автоматического восстановления...',
      status: APP_LOG_STATUSES.ERROR,
    }
  }

  return null
}

/**
 * Формирует запись журнала о доступе к чату Twitch.
 *
 * @returns Запись журнала или `null`, если для статуса нет сообщения.
 */
const getChatAccessLogEntry = (status: ChatAccessStatus, channel: string | null): SystemLogEntry | null => {
  const targetChannel = channel ? `@${channel}` : 'Twitch'

  if (status === TWITCH_CHAT_ACCESS_STATUSES.CONNECTED) {
    return {
      message: `Чат канала ${targetChannel} подключен: бот может читать чат и отправлять сообщения.`,
      status: APP_LOG_STATUSES.SUCCESS,
    }
  }

  if (status === TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED) {
    return {
      message: `Доступ к чату ${targetChannel} ограничен: бот может читать чат, отправка сообщений ограничена.`,
      status: APP_LOG_STATUSES.SUCCESS,
    }
  }

  if (status === TWITCH_CHAT_ACCESS_STATUSES.BANNED) {
    return {
      message: `Доступ к чату ${targetChannel} заблокирован: аккаунт бота забанен на канале.`,
      status: APP_LOG_STATUSES.ERROR,
    }
  }

  return null
}

/**
 * Изолированный хук-наблюдатель для автоматического логирования
 * глобальных системных событий (авторизация, сеть, права чата).
 */
export const useAppLogsObserver = (): void => {
  const { connectionStatus, chatAccessStatus, getClient } = useSocketContext()
  const { session, userDisplayName } = useAuth()
  const actorUsername = useActorUsername()
  const { pushLog } = useAppLogs()

  const lastStatusRef = useRef(connectionStatus)
  const lastChatAccessRef = useRef(chatAccessStatus)
  const lastUserRef = useRef<string | null>(null)

  const logSystemEvent = useCallback((entry: SystemLogEntry | null): void => {
    if (!entry) return

    pushLog({
      message: entry.message,
      status: entry.status,
      source: APP_LOG_SOURCES.APPLICATION,
      actorUsername,
    })
  }, [pushLog, actorUsername])

  useEffect(() => {
    const login = session?.login

    // Выход из аккаунта сбрасывает отметку, чтобы следующий вход снова дал запись.
    if (!login) {
      lastUserRef.current = null
      return
    }

    if (login === lastUserRef.current) return

    lastUserRef.current = login

    pushLog({
      message: `Вы вошли в аккаунт: ${userDisplayName ?? login}`,
      status: APP_LOG_STATUSES.SUCCESS,
      source: APP_LOG_SOURCES.APPLICATION,
      actorUsername: userDisplayName ?? login,
    })
  }, [session, pushLog, userDisplayName])

  useEffect(() => {
    if (connectionStatus === lastStatusRef.current) return
    lastStatusRef.current = connectionStatus

    const client = getClient()

    logSystemEvent(getConnectionLogEntry({
      status: connectionStatus,
      channel: client.currentChannel,
      reconnectAttempts: client.reconnectAttempts,
      failureReason: client.failureReason,
      isIntentionallyDisconnected: client.isIntentionallyDisconnected,
    }))
  }, [connectionStatus, logSystemEvent, getClient])

  useEffect(() => {
    if (chatAccessStatus === lastChatAccessRef.current) return
    lastChatAccessRef.current = chatAccessStatus

    logSystemEvent(getChatAccessLogEntry(chatAccessStatus, getClient().currentChannel))
  }, [chatAccessStatus, logSystemEvent, getClient])
}
