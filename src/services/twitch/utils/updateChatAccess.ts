import type { RefObject } from 'react'
import { TwitchIrcCommand } from '../config'
import { CHAT_ACCESS_STATUSES, type ChatAccessStatus } from '../../socket/types.ts'
import { checkIsRoomRestricted } from './checkIsRoomRestricted'
import type { ParsedIrcMessage } from '../types.ts'
import { APP_LOG_STATUSES, type AppLogItem, LOG_SOURCE } from '../../../features/app-logs/types.ts'

interface UpdateChatAccessProps {
  message: ParsedIrcMessage;
  currentUserLogin?: string;
  pendingTextsRef: { current: string[] };
  timeoutTimerRef: RefObject<ReturnType<typeof setTimeout> | null>;
  updateChatAccessStatus: (status: ChatAccessStatus) => void;
  pushLog: (log: {
    message: AppLogItem['message'];
    status?: AppLogItem['status'];
    source: AppLogItem['source'];
    actorUsername: AppLogItem['actorUsername'];
    rawCommand?: AppLogItem['rawCommand'];
  }) => void;
  currentRoomTags?: Record<string, string>;
}

/**
 * Анализирует входящие IRC-команды Twitch для динамического переключения
 * статуса доступности чата и очистки застрявших очередей сообщений.
 */
export const updateChatAccess = ({
  message,
  currentUserLogin,
  pendingTextsRef,
  timeoutTimerRef,
  updateChatAccessStatus,
  pushLog,
  currentRoomTags = {},
}: UpdateChatAccessProps): void => {

  const pushStatusLog = (logMessage: string) => {
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source: LOG_SOURCE.APPLICATION, actorUsername: 'twitch' })
  }

  // 1. Обработка глобальных настроек комнаты
  if (message.command === TwitchIrcCommand.ROOM_STATE) {
    const tags = message.tags || {}

    // Если это стартовый пакет инициализации комнаты — формируем одно общее лог-уведомление
    const hasAllTags = tags['subs-only'] !== undefined && tags.slow !== undefined && tags['emote-only'] !== undefined

    if (hasAllTags) {
      const activeRestrictions: string[] = []

      if (tags['subs-only'] === '1') activeRestrictions.push('только для подписчиков')
      if (tags['emote-only'] === '1') activeRestrictions.push('только смайлы')
      if (tags.slow && tags.slow !== '0') activeRestrictions.push(`медленный режим (${tags.slow} сек.)`)
      if (tags['followers-only'] && tags['followers-only'] !== '-1') activeRestrictions.push('только для фолловеров')

      if (activeRestrictions.length > 0) {
        pushStatusLog(`Активные ограничения чата: ${activeRestrictions.join(', ')}.`)
      }
    } else {
      // Пошаговые точечные логи при изменении режимов модераторами в реальном времени
      if (tags['subs-only'] === '1') {
        pushStatusLog('Включен режим "Только для подписчиков".')
      } else if (tags['subs-only'] === '0') {
        pushStatusLog('Режим "Только для подписчиков" отключен.')
      }

      if (tags['emote-only'] === '1') {
        pushStatusLog('Включен режим "Только смайлы".')
      } else if (tags['emote-only'] === '0') {
        pushStatusLog('Режим "Только смайлы" отключен.')
      }

      if (tags.slow && tags.slow !== '0') {
        pushStatusLog(`Включен медленный режим (${tags.slow} сек.).`)
      } else if (tags.slow === '0') {
        pushStatusLog('Медленный режим отключен.')
      }
    }

    // 2. Передаем в валидатор полную историю ограничений комнаты вместо обрывистого сообщения
    const isRestricted = checkIsRoomRestricted({ ...message, tags: currentRoomTags })
    updateChatAccessStatus(isRestricted ? CHAT_ACCESS_STATUSES.RESTRICTED : CHAT_ACCESS_STATUSES.CONNECTED)
    return
  }

  // 2. Персональные блокировки из NOTICE (ошибки отправки при муте)
  if (message.command === TwitchIrcCommand.NOTICE) {
    const msgId = message.tags?.['msg-id']

    if (msgId === 'msg_banned') {
      pushStatusLog('Ошибка отправки сообщения: аккаунт забанен на канале.')
      updateChatAccessStatus(CHAT_ACCESS_STATUSES.BANNED)
      pendingTextsRef.current = []
    } else if (msgId === 'msg_subsonly' || msgId === 'msg_followersonly' || msgId === 'msg_timedout') {
      pushStatusLog(`Ошибка отправки сообщения: чат ограничен (причина: ${msgId}).`)
      updateChatAccessStatus(CHAT_ACCESS_STATUSES.RESTRICTED)
      pendingTextsRef.current = []
    }
    return
  }

  // 3. Мгновенный перехват мута/бана нашего аккаунта через CLEAR_CHAT
  if (message.command === TwitchIrcCommand.CLEAR_CHAT) {
    const targetUser = message.text?.trim()?.toLowerCase()

    if (targetUser && targetUser === currentUserLogin) {
      const durationStr = message.tags?.['ban-duration']

      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
        timeoutTimerRef.current = null
      }

      if (durationStr) {
        pushStatusLog(`Аккаунт получил таймаут на ${durationStr} сек.`)
        updateChatAccessStatus(CHAT_ACCESS_STATUSES.RESTRICTED)

        const durationSeconds = parseInt(durationStr, 10)

        if (!isNaN(durationSeconds) && durationSeconds > 0) {
          timeoutTimerRef.current = setTimeout(() => {
            pushStatusLog('Время таймаута истекло.')
            updateChatAccessStatus(CHAT_ACCESS_STATUSES.CONNECTED)
            timeoutTimerRef.current = null
          }, durationSeconds * 1000)
        }
      } else {
        pushStatusLog('Аккаунт перманентно забанен на канале.')
        updateChatAccessStatus(CHAT_ACCESS_STATUSES.BANNED)
      }
    }
    return
  }

  // 4. Перехват успешного USER_STATE (сигнал разбана или успешной отправки)
  if (message.command === TwitchIrcCommand.USER_STATE) {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
      pushStatusLog('Ограничение чата досрочно снято.')
    }
    updateChatAccessStatus(CHAT_ACCESS_STATUSES.CONNECTED)
    return
  }
}
