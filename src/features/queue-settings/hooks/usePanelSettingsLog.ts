import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { APP_LOG_STATUSES, type AppLogStatus, LOG_SOURCE, type LogSource } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useQueueSettings } from './useQueueSettings.ts'
import { useEffect, useRef } from 'react'
import type { QueueSettings } from '../types.ts'

export interface logChangeArgs {
  message: string
  status?: AppLogStatus
  source?: LogSource
  actorUsername?: string
}

// Словарь названий базовых настроек
const SETTING_LABELS: Record<string, string> = {
  maxQueueSize: 'Лимит участников в очереди',
  allowPreJoin: 'Разрешить запись в список ожидающих',
  allowMultipleEntries: 'Разрешить запись в список ожидающих участников текущей очереди',
  moveOnSizeChange: 'Автоперенос игроков из списка ожидающих при изменении размера очереди',
  sessionHistoryCooldown: 'Через сколько минут игрок может повторно участвовать',
  gamesPlayedCooldown: 'Через сколько игр игрок может повторно участвовать',
  maxGamesPerUser: 'Лимит игр для одного игрока',
  prioritizeSubscribers: 'Приоритет для подписчиков',
  subscribersOnly: 'Вход только для подписчиков',
  botMessageCooldown: 'Задержка ответов бота (сек)',
}

// Словарь разрешений сообщений
const NOTIFICATION_LABELS: Record<string, string> = {
  allowSending: 'Разрешить боту отправку сообщений в чат',
  onQueueOpen: 'Сообщение об открытии очереди',
  onQueueFull: 'Сообщение об заполнении текущей очереди',
  onQueueClose: 'Сообщение о закрытии очереди',
  onMemberAdd: 'Сообщение о добавлении игрока в очередь',
  onMemberRemove: 'Сообщение о удалении игрока из очереди',
  onMemberMove: 'Сообщение о перемещении игрока между очередями',
}

// Словарь разрешений сообщений
const COMMAND_LABELS: Record<string, string> = {
  join: 'Вступление в очередь',
  leave: 'Выход из очереди',
  show: 'Показать текущую очередь',
  clear: 'Очистить очереди',
  add: 'Добавить в очередь',
  delete: 'Удалить из очереди',
  start: 'Открыть очередь',
  stop: 'Закрыть очередь',
  play: 'Завершить текущую очередь',
}

/**
 * Кастомный хук для автоматического логирования изменений настроек очереди.
 */
export const usePanelSettingsLog = () => {
  const { session, userDisplayName } = useAuth()
  const { settings } = useQueueSettings()
  const { pushLog } = useAppLogs()

  // Храним предыдущее состояние настроек, инициализируем текущими при первом рендере
  const prevSettingsRef = useRef<QueueSettings | null>(settings)

  const logUserName = userDisplayName ?? session?.login ?? 'Стример'

  const logChange = ({
    message,
    status = APP_LOG_STATUSES.WARNING,
    source = LOG_SOURCE.STREAMER_UI,
    actorUsername = logUserName,
  }: logChangeArgs) => {
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

    // Если это первый рендер, просто сохраняем текущий объект настроек
    if (!prev || !settings) {
      prevSettingsRef.current = settings
      return
    }

    // 1. Плоские (базовые) настройки
    (Object.keys(SETTING_LABELS) as Array<keyof QueueSettings>).forEach(key => {
      const currentVal = settings[key]
      const prevVal = prev[key]

      if (currentVal !== prevVal && prevVal !== undefined) {
        logChange({
          message: `Настройки изменены: ${SETTING_LABELS[key]} - ${formatValue(currentVal)}`,
        })
      }
    })

    // 2. Разрешения сообщений (chatNotificationPermissions)
    if (settings.chatNotificationPermissions && prev.chatNotificationPermissions) {
      Object.keys(NOTIFICATION_LABELS).forEach(key => {
        const k = key as keyof QueueSettings['chatNotificationPermissions']
        const currentVal = settings.chatNotificationPermissions[k]
        const prevVal = prev.chatNotificationPermissions[k]

        if (currentVal !== prevVal && prevVal !== undefined) {
          logChange({
            message: `Настройки изменены (Сообщения): ${NOTIFICATION_LABELS[k]} - ${formatValue(currentVal)}`,
          })
        }
      })
    }

    // 3. Изменения команд (commands)
    if (settings.commands && prev.commands) {
      Object.keys(settings.commands).forEach(commandKey => {
        const k = commandKey as keyof QueueSettings['commands']
        const currentCmd = settings.commands[k]
        const prevCmd = prev.commands[k]
        const commandLabel = COMMAND_LABELS[k] || k

        if (prevCmd) {
          // Проверка изменения триггера (имени команды)
          if (currentCmd.name !== prevCmd.name) {
            logChange({
              message: `Настройки изменены: Триггер команды "${commandLabel}" изменен с "${prevCmd.name}" на "${currentCmd.name}"`,
            })
          }
          // Проверка изменения прав доступа
          if (currentCmd.isModeratorOnly !== prevCmd.isModeratorOnly) {
            logChange({
              message: `Настройки изменены: Доступ к команде "${currentCmd.name}" (${commandLabel}) только для модераторов - "${formatValue(currentCmd.isModeratorOnly)}"`,
            })
          }
        }
      })
    }

    // 4. Изменение текущей игры (currentGame)
    if (settings.currentGame?.key !== prev.currentGame?.key) {
      const gameName = settings.currentGame?.key ?? 'Не выбрано'
      logChange({
        message: `Настройки изменены: Выбрана игра - ${gameName}`,
      })
    }

    // Обновляем реф актуальными настройками для следующего сравнения
    prevSettingsRef.current = settings

    // eslint-disable-next-line
  }, [settings, logUserName]) // Только при изменении объекта настроек или пользователя
}
