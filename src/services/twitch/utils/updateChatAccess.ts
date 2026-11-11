import type { RefObject } from 'react'
import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import { TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import { TWITCH_CHAT_ACCESS_STATUSES, type ChatAccessStatus } from '../../socket/types.ts'
import { checkIsRoomRestricted } from './checkIsRoomRestricted'
import {
  isRoomStateInitialization,
  parseRoomStateRestrictions,
  ROOM_STATE_LOG_PRIORITY,
  ROOM_STATE_SUMMARY_PRIORITY,
} from './roomState.ts'
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
    const restrictions = parseRoomStateRestrictions(tags)

    // Стартовый пакет инициализации комнаты содержит все теги сразу
    if (isRoomStateInitialization(tags)) {
      const activeRestrictions = ROOM_STATE_SUMMARY_PRIORITY
        .map(tag => restrictions[tag])
        .filter(restriction => restriction?.isActive)
        .map(restriction => restriction?.description ?? '')

      if (activeRestrictions.length > 0) {
        pushStatusLog(`Активные ограничения чата: ${activeRestrictions.join(', ')}.`)
      }
    } else {
      for (const tag of ROOM_STATE_LOG_PRIORITY) {
        const restriction = restrictions[tag]

        if (restriction) {
          pushStatusLog(restriction.message)
        }
      }
    }

    // Проверяем полную историю ограничений комнаты, а не только текущее сообщение
    const isRestricted = checkIsRoomRestricted({ ...message, tags: currentRoomTags })
    updateChatAccessStatus(isRestricted ? TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED : TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
    return
  }

  // Персональные блокировки из NOTICE (ошибки отправки при муте)
  if (message.command === TWITCH_IRC_COMMANDS.NOTICE) {
    const msgId = message.tags?.[TWITCH_IRC_TAGS.MSG_ID]

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

    const durationStr = message.tags?.[TWITCH_IRC_TAGS.BAN_DURATION]

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
