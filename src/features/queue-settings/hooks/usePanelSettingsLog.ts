import { useQueueSettings } from './useQueueSettings.ts'
import { useSettingsLog } from './useSettingsLog.ts'
import { useEffect, useRef } from 'react'
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

/** Логирует изменения настроек очереди, сделанные через панель. */
export const usePanelSettingsLog = () => {
  const { settings } = useQueueSettings()
  const logChange = useSettingsLog()

  const prevSettingsRef = useRef<QueueSettings | null>(settings)

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
