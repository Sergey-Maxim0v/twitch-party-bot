import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { APP_LOG_STATUSES, type AppLogStatus, APP_LOG_SOURCES, type LogSource } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useQueueSettings } from './useQueueSettings.ts'
import { useEffect, useRef } from 'react'
import type { QueueSettings } from '../types.ts'
import {
  QUEUE_COMMAND_LABELS,
  QUEUE_NOTIFICATION_LABELS,
  QUEUE_SETTING_LABELS,
} from '../../../constants/queue.constants.ts'

interface LogChangeArgs {
  message: string
  status?: AppLogStatus
  source?: LogSource
  actorUsername?: string
}

/**
 * Кастомный хук для автоматического логирования изменений настроек очереди.
 */
export const usePanelSettingsLog = () => {
  const { session, userDisplayName } = useAuth()
  const { settings } = useQueueSettings()
  const { pushLog } = useAppLogs()

  const prevSettingsRef = useRef<QueueSettings | null>(settings)

  const logUserName = userDisplayName ?? session?.login ?? 'Стример'

  const logChange = ({
    message,
    status = APP_LOG_STATUSES.WARNING,
    source = APP_LOG_SOURCES.STREAMER_UI,
    actorUsername = logUserName,
  }: LogChangeArgs) => {
    pushLog({
      message,
      status,
      source,
      actorUsername,
    })
  }

  const formatValue = (value: unknown): string => {
    if (typeof value === 'boolean') return value ? 'Вкл' : 'Выкл'
    return String(value ?? 'Не задано')
  }

  useEffect(() => {
    const prev = prevSettingsRef.current

    if (!prev || !settings) {
      prevSettingsRef.current = settings
      return
    }

    (Object.keys(QUEUE_SETTING_LABELS) as Array<keyof QueueSettings>).forEach(key => {
      const currentVal = settings[key]
      const prevVal = prev[key]

      if (currentVal !== prevVal && prevVal !== undefined) {
        logChange({
          message: `Настройки изменены: ${QUEUE_SETTING_LABELS[key]} - ${formatValue(currentVal)}`,
        })
      }
    })

    if (settings.messagePrefix !== prev.messagePrefix && prev.messagePrefix !== undefined) {
      logChange({
        message: `Настройки изменены (Сообщения): Префикс для автоматических сообщений в чат Twitch - ${formatValue(settings.messagePrefix)}`,
      })
    }

    if (settings.chatNotificationPermissions && prev.chatNotificationPermissions) {
      Object.keys(QUEUE_NOTIFICATION_LABELS).forEach(key => {
        const k = key as keyof QueueSettings['chatNotificationPermissions']
        const currentVal = settings.chatNotificationPermissions[k]
        const prevVal = prev.chatNotificationPermissions[k]

        if (currentVal !== prevVal && prevVal !== undefined) {
          logChange({
            message: `Настройки изменены (Сообщения): ${QUEUE_NOTIFICATION_LABELS[k]} - ${formatValue(currentVal)}`,
          })
        }
      })
    }

    if (settings.commands && prev.commands) {
      Object.keys(settings.commands).forEach(commandKey => {
        const k = commandKey as keyof QueueSettings['commands']
        const currentCmd = settings.commands[k]
        const prevCmd = prev.commands[k]
        const commandLabel = QUEUE_COMMAND_LABELS[k] || k

        if (!prevCmd) return

        if (currentCmd.name !== prevCmd.name) {
          logChange({
            message: `Настройки изменены: Триггер команды "${commandLabel}" изменен с "${prevCmd.name}" на "${currentCmd.name}"`,
          })
        }

        if (currentCmd.isModeratorOnly !== prevCmd.isModeratorOnly) {
          logChange({
            message: `Настройки изменены: Доступ к команде "${currentCmd.name}" (${commandLabel}) только для модераторов - "${formatValue(currentCmd.isModeratorOnly)}"`,
          })
        }
      })
    }

    if (settings.currentGame?.key !== prev.currentGame?.key) {
      const gameName = settings.currentGame?.key ?? 'Не выбрано'
      logChange({
        message: `Настройки изменены: Выбрана игра - ${gameName}`,
      })
    }

    prevSettingsRef.current = settings

    // eslint-disable-next-line
  }, [settings, logUserName])
}
