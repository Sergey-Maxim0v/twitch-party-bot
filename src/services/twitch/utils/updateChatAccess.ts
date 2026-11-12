import type { RefObject } from 'react'
import { TWITCH_IRC_COMMANDS, TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import { TWITCH_CHAT_ACCESS_STATUSES, type ChatAccessStatus } from '../../socket/types.ts'
import { checkIsRoomRestricted } from './checkIsRoomRestricted'
import {
  isRoomStateInitialization,
  parseRoomStateRestrictions,
  ROOM_STATE_LOG_PRIORITY,
  ROOM_STATE_SUMMARY_PRIORITY,
} from './roomState.ts'
import type { ParsedIrcMessage, PendingChatMessage } from '../types.ts'
import { APP_LOG_STATUSES, type AppLogItem, APP_LOG_SOURCES } from '../../../features/app-logs/types.ts'
import { getChatSendError, isUnknownChatSendError } from './chatSendErrors.ts'

interface UpdateChatAccessProps {
  message: ParsedIrcMessage;
  currentUserLogin?: string;
  pendingMessagesRef: RefObject<PendingChatMessage[]>;
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
 * Обновляет статус доступа к чату и снимает недоставленные сообщения
 * по входящим IRC-событиям Twitch.
 */
export const updateChatAccess = ({
  message,
  currentUserLogin,
  pendingMessagesRef,
  timeoutTimerRef,
  updateChatAccessStatus,
  pushLog,
  currentRoomTags = {},
}: UpdateChatAccessProps): void => {

  const pushStatusLog = (logMessage: string) => {
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source: APP_LOG_SOURCES.APPLICATION, actorUsername: 'twitch' })
  }

  /**
   * Снимает сообщения из очереди и вызывает `onFailed`.
   * @param reason - Причина недоставки.
   * @param rejectAll - Снять всю очередь или только первое сообщение.
   */
  const rejectPendingMessages = (reason: string, rejectAll: boolean): void => {
    const pendingMessages = pendingMessagesRef.current
    if (pendingMessages.length === 0) return

    const rejectedMessages = rejectAll
      ? pendingMessages.splice(0, pendingMessages.length)
      : pendingMessages.splice(0, 1)

    rejectedMessages.forEach(pendingMessage => pendingMessage.onFailed?.(reason))
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

    // Учитываем все активные ограничения комнаты, а не только текущее сообщение
    const isRestricted = checkIsRoomRestricted({ ...message, tags: currentRoomTags })
    updateChatAccessStatus(isRestricted ? TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED : TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
    return
  }

  // Персональные блокировки из NOTICE (ошибки отправки при муте)
  if (message.command === TWITCH_IRC_COMMANDS.NOTICE) {
    const msgId = message.tags?.[TWITCH_IRC_TAGS.MSG_ID]
    const sendError = getChatSendError(msgId)

    if (sendError) {
      pushStatusLog(sendError.logMessage)

      if (sendError.status) {
        updateChatAccessStatus(sendError.status)
      }

      rejectPendingMessages(sendError.logMessage, sendError.rejectsAllPending)
      return
    }

    // Неизвестная ошибка: показываем в журнале и снимаем одно сообщение
    if (isUnknownChatSendError(msgId)) {
      const unknownErrorMessage = `Неизвестная ошибка отправки сообщения Twitch (${msgId}).`
      pushStatusLog(unknownErrorMessage)
      rejectPendingMessages(unknownErrorMessage, false)
      return
    }

    // Прочий NOTICE также снимает одно сообщение из очереди
    pendingMessagesRef.current.shift()
    return
  }

  // Бан или таймаут нашего аккаунта
  if (message.command === TWITCH_IRC_COMMANDS.CLEAR_CHAT) {
    const targetUser = message.text?.trim()?.toLowerCase()

    if (!targetUser || targetUser !== currentUserLogin) return

    const durationStr = message.tags?.[TWITCH_IRC_TAGS.BAN_DURATION]

    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }

    // Перманентный бан
    if (!durationStr) {
      const reason = 'Аккаунт перманентно забанен на канале.'
      pushStatusLog(reason)
      updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.BANNED)
      rejectPendingMessages(reason, true)
      return
    }

    const durationSeconds = parseInt(durationStr, 10)

    // Таймаут
    if (!isNaN(durationSeconds) && durationSeconds > 0) {
      const reason = `Аккаунт получил таймаут на ${durationStr} сек.`
      pushStatusLog(reason)
      updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED)
      rejectPendingMessages(reason, true)

      timeoutTimerRef.current = setTimeout(() => {
        pushStatusLog('Время таймаута истекло.')
        updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
        timeoutTimerRef.current = null
      }, durationSeconds * 1000)
    } else {
      // Некорректная длительность таймаута
      const reason = 'Аккаунт забанен (некорректный формат времени таймаута).'
      pushStatusLog(reason)
      updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.BANNED)
      rejectPendingMessages(reason, true)
    }
    return
  }

  // Разбан или успешная отправка
  if (message.command === TWITCH_IRC_COMMANDS.USER_STATE) {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
      pushStatusLog('Ограничение чата досрочно снято.')
    }
    updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
  }
}
