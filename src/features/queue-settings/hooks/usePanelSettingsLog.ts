import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { APP_LOG_STATUSES, type AppLogStatus, APP_LOG_SOURCES, type LogSource } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useQueueSettings } from './useQueueSettings.ts'
import { useCallback, useEffect, useRef } from 'react'
import type { QueueSettings } from '../types.ts'
import {
  QUEUE_COMMAND_LABELS,
  QUEUE_MESSAGE_PREFIX_LABEL,
  QUEUE_NOTIFICATION_LABELS,
  QUEUE_SETTINGS_FALLBACKS,
  QUEUE_SETTINGS_LOG_PREFIXES,
  QUEUE_SETTING_LABELS,
} from '../../../constants/queue.constants.ts'
import { formatSettingValue } from '../utils/formatSettingValue.ts'

interface LogChangeArgs {
  message: string
  status?: AppLogStatus
  source?: LogSource
  actorUsername?: string
}

/** Логирует изменения настроек очереди, сделанные через панель. */
export const usePanelSettingsLog = () => {
  const { session, userDisplayName } = useAuth()
  const { settings } = useQueueSettings()
  const { pushLog } = useAppLogs()

  const prevSettingsRef = useRef<QueueSettings | null>(settings)

  const logUserName = userDisplayName ?? session?.login ?? QUEUE_SETTINGS_FALLBACKS.ACTOR

  const logChange = useCallback(({
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
  }, [logUserName, pushLog])

  useEffect(() => {
    const prev = prevSettingsRef.current

    if (!prev || !settings) {
      prevSettingsRef.current = settings
      return
    }

    (Object.keys(QUEUE_SETTING_LABELS) as Array<keyof typeof QUEUE_SETTING_LABELS>).forEach(key => {
      const currentVal = settings[key]
      const prevVal = prev[key]

      if (currentVal === prevVal || prevVal === undefined) return

      logChange({
        message: `${QUEUE_SETTINGS_LOG_PREFIXES.SETTING} ${QUEUE_SETTING_LABELS[key]} - ${formatSettingValue({ settingKey: key, value: currentVal })}`,
      })
    })

    if (settings.messagePrefix !== prev.messagePrefix && prev.messagePrefix !== undefined) {
      logChange({
        message: `${QUEUE_SETTINGS_LOG_PREFIXES.MESSAGE} ${QUEUE_MESSAGE_PREFIX_LABEL} - ${formatSettingValue({ value: settings.messagePrefix })}`,
      })
    }

    (Object.keys(QUEUE_NOTIFICATION_LABELS) as Array<keyof typeof QUEUE_NOTIFICATION_LABELS>).forEach(key => {
      const currentVal = settings.chatNotificationPermissions?.[key]
      const prevVal = prev.chatNotificationPermissions?.[key]

      if (currentVal === prevVal || prevVal === undefined) return

      logChange({
        message: `${QUEUE_SETTINGS_LOG_PREFIXES.MESSAGE} ${QUEUE_NOTIFICATION_LABELS[key]} - ${formatSettingValue({ value: currentVal })}`,
      })
    })

    Object.keys(settings.commands ?? {}).forEach(commandKey => {
      const key = commandKey as keyof QueueSettings['commands']
      const currentCmd = settings.commands?.[key]
      const prevCmd = prev.commands?.[key]
      const commandLabel = QUEUE_COMMAND_LABELS[key]

      if (!currentCmd || !prevCmd) return

      if (currentCmd.name !== prevCmd.name) {
        logChange({
          message: `${QUEUE_SETTINGS_LOG_PREFIXES.SETTING} Триггер команды "${commandLabel}" изменен с "${prevCmd.name}" на "${currentCmd.name}"`,
        })
      }

      if (currentCmd.isModeratorOnly !== prevCmd.isModeratorOnly) {
        logChange({
          message: `${QUEUE_SETTINGS_LOG_PREFIXES.SETTING} Доступ к команде "${currentCmd.name}" (${commandLabel}) только для модераторов - "${formatSettingValue({ value: currentCmd.isModeratorOnly })}"`,
        })
      }
    })

    if (settings.currentGame?.key !== prev.currentGame?.key) {
      const gameName = settings.currentGame?.key ?? QUEUE_SETTINGS_FALLBACKS.GAME
      logChange({
        message: `${QUEUE_SETTINGS_LOG_PREFIXES.SETTING} Выбрана игра - ${gameName}`,
      })
    }

    prevSettingsRef.current = settings
  }, [settings, logChange])
}
