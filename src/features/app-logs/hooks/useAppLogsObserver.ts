import { useEffect, useRef } from 'react'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { useAppLogs } from './useAppLogs.ts'
import { APP_LOG_STATUSES, type AppLogStatus, APP_LOG_SOURCES } from '../types.ts'
import { SOCKET_CONNECTION_STATUSES, TWITCH_CHAT_ACCESS_STATUSES } from '../../../services/socket/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'

/**
 * Изолированный хук-наблюдатель для автоматического логирования
 * глобальных системных событий (авторизация, сеть, права чата).
 */
export const useAppLogsObserver = (): void => {
  const { connectionStatus, chatAccessStatus, getClient } = useSocketContext()
  const { session, userDisplayName } = useAuth()
  const { pushLog } = useAppLogs()

  const lastStatusRef = useRef(connectionStatus)
  const lastChatAccessRef = useRef(chatAccessStatus)
  const lastUserRef = useRef<string | null>(null)

  useEffect(() => {
    if (session?.login && session.login !== lastUserRef.current) {
      lastUserRef.current = session.login
      pushLog({
        message: `Вы вошли в аккаунт: ${userDisplayName ?? session.login}`,
        status: APP_LOG_STATUSES.SUCCESS,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername: userDisplayName ?? session.login,
      })
    }
  }, [session, pushLog, userDisplayName])

  useEffect(() => {
    if (connectionStatus === lastStatusRef.current) return
    lastStatusRef.current = connectionStatus

    const client = getClient()
    const channel = client?.currentChannel
    const targetChannel = channel ? `@${channel}` : 'Twitch'

    let message = ''
    let status: AppLogStatus = APP_LOG_STATUSES.SUCCESS

    if (connectionStatus === SOCKET_CONNECTION_STATUSES.CONNECTING) {
      const currentAttempts = client?.reconnectAttempts ?? 0
      message = currentAttempts > 0
        ? `Повторная попытка подключения к каналу ${targetChannel} (№${currentAttempts})...`
        : `Подключение к каналу ${targetChannel}...`
    } else if (connectionStatus === SOCKET_CONNECTION_STATUSES.CONNECTED) {
      message = `Подключение к каналу ${targetChannel} установлено.`
      status = APP_LOG_STATUSES.SUCCESS
    } else if (connectionStatus === SOCKET_CONNECTION_STATUSES.DISCONNECTED) {
      const isIntentionally = client?.isIntentionallyDisconnected ?? false
      message = isIntentionally
        ? `Соединение с каналом ${targetChannel} закрыто пользователем.`
        : 'Соединение с Twitch потеряно. Запуск автоматического восстановления...'
      status = APP_LOG_STATUSES.ERROR
    }

    if (message) {
      pushLog({
        message,
        status,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername: userDisplayName ?? session?.login ?? 'Application',
      })
    }
  }, [connectionStatus, pushLog, getClient, session?.login, userDisplayName])

  useEffect(() => {
    if (chatAccessStatus === lastChatAccessRef.current) return
    lastChatAccessRef.current = chatAccessStatus

    const channel = getClient()?.currentChannel || ''
    const targetChannel = channel ? `@${channel}` : 'Twitch'

    let message = ''
    let status: AppLogStatus = APP_LOG_STATUSES.SUCCESS

    if (chatAccessStatus === TWITCH_CHAT_ACCESS_STATUSES.CONNECTED) {
      message = `Чат канала ${targetChannel} подключен: бот может читать чат и отправлять сообщения.`
      status = APP_LOG_STATUSES.SUCCESS
    } else if (chatAccessStatus === TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED) {
      message = `Доступ к чату ${targetChannel} ограничен: бот может читать чат, отправка сообщений ограничена.`
      status = APP_LOG_STATUSES.SUCCESS
    } else if (chatAccessStatus === TWITCH_CHAT_ACCESS_STATUSES.BANNED) {
      message = `Доступ к чату ${targetChannel} заблокирован: аккаунт бота забанен на канале.`
      status = APP_LOG_STATUSES.ERROR
    }

    if (message) {
      pushLog({
        message,
        status,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername: userDisplayName ?? session?.login ?? 'Application',
      })
    }
  }, [chatAccessStatus, getClient, pushLog, session?.login, userDisplayName])
}
