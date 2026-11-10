import type { RefObject } from 'react'
import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import { TWITCH_CHAT_ACCESS_STATUSES, type ChatAccessStatus } from '../../socket/types.ts'
import { checkIsRoomRestricted } from './checkIsRoomRestricted'
import type { ParsedIrcMessage } from '../types.ts'
import { APP_LOG_STATUSES, type AppLogItem, APP_LOG_SOURCES } from '../../../features/app-logs/types.ts'

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
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source: APP_LOG_SOURCES.APPLICATION, actorUsername: 'twitch' })
  }

  if (message.command === TWITCH_IRC_COMMANDS.ROOM_STATE) {
    const tags = message.tags || {}

    // Стартовый пакет инициализации комнаты содержит все теги сразу
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

    // Проверяем полную историю ограничений комнаты, а не только текущее сообщение
    const isRestricted = checkIsRoomRestricted({ ...message, tags: currentRoomTags })
    updateChatAccessStatus(isRestricted ? TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED : TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
    return
  }

  // Персональные блокировки из NOTICE (ошибки отправки при муте)
  if (message.command === TWITCH_IRC_COMMANDS.NOTICE) {
    const msgId = message.tags?.['msg-id']

    if (msgId === 'msg_banned') {
      pushStatusLog('Ошибка отправки сообщения: аккаунт забанен на канале.')
      updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.BANNED)
      pendingTextsRef.current = []
    } else if (msgId === 'msg_subsonly' || msgId === 'msg_followersonly' || msgId === 'msg_timedout') {
      pushStatusLog(`Ошибка отправки сообщения: чат ограничен (причина: ${msgId}).`)
      updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED)
      pendingTextsRef.current = []
    }
    return
  }

  // Мгновенный перехват мута/бана нашего аккаунта через CLEARCHAT
  if (message.command === TWITCH_IRC_COMMANDS.CLEAR_CHAT) {
    const targetUser = message.text?.trim()?.toLowerCase()

    if (!targetUser || targetUser !== currentUserLogin) return

    const durationStr = message.tags?.['ban-duration']

    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }

    // 1. Обработка перманентного бана (тег отсутствует)
    if (!durationStr) {
      pushStatusLog('Аккаунт перманентно забанен на канале.')
      updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.BANNED)
      return
    }

    const durationSeconds = parseInt(durationStr, 10)

    // 2. Обработка валидного тайм-аута
    if (!isNaN(durationSeconds) && durationSeconds > 0) {
      pushStatusLog(`Аккаунт получил таймаут на ${durationStr} сек.`)
      updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED)

      timeoutTimerRef.current = setTimeout(() => {
        pushStatusLog('Время таймаута истекло.')
        updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
        timeoutTimerRef.current = null
      }, durationSeconds * 1000)
    } else {
      // 3. Фолбек-защита (на случай аномальных данных от API)
      pushStatusLog('Аккаунт забанен (некорректный формат времени таймаута).')
      updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.BANNED)
    }
    return
  }

  // Успешный USERSTATE — сигнал разбана или успешной отправки
  if (message.command === TWITCH_IRC_COMMANDS.USER_STATE) {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
      pushStatusLog('Ограничение чата досрочно снято.')
    }
    updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
  }
}
