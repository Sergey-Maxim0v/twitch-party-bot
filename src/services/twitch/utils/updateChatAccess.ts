import type { RefObject } from 'react'
import { TWITCH_CHAT_ACCESS_LOG_MESSAGES, TWITCH_IRC_COMMANDS, TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import { TWITCH_CHAT_ACCESS_STATUSES, type ChatAccessStatus } from '../../socket/types.ts'
import { checkIsRoomRestricted } from './checkIsRoomRestricted'
import { isTwitchAuthFailureNotice } from './isTwitchAuthFailureNotice.ts'
import {
  isRoomStateInitialization,
  parseRoomStateRestrictions,
  ROOM_STATE_LOG_PRIORITY,
  ROOM_STATE_SUMMARY_PRIORITY,
  type RoomStateRestrictions,
} from './roomState.ts'
import type { ParsedIrcMessage, PendingChatMessage } from '../types.ts'
import { APP_LOG_STATUSES, type AppLogItem, APP_LOG_SOURCES } from '../../../features/app-logs/types.ts'
import { getChatSendError, isUnknownChatSendError, type ChatSendErrorInfo } from './chatSendErrors.ts'
import { rejectPendingMessages } from './rejectPendingMessages.ts'
import { APP_LOG_TWITCH_ACTOR } from '../../../constants/app-logs.constants.ts'

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

/** Записывает событие доступа к чату в журнал приложения. */
type PushStatusLog = (logMessage: string) => void

/**
 * Логирует режимы комнаты: стартовый пакет — сводкой, изменения — по каждому режиму.
 */
const logRoomStateRestrictions = (
  tags: Record<string, string>,
  restrictions: RoomStateRestrictions,
  pushStatusLog: PushStatusLog,
): void => {
  if (!isRoomStateInitialization(tags)) {
    for (const tag of ROOM_STATE_LOG_PRIORITY) {
      const restriction = restrictions[tag]

      if (!restriction) continue

      pushStatusLog(restriction.message)
    }

    return
  }

  const activeRestrictions = ROOM_STATE_SUMMARY_PRIORITY
    .map(tag => restrictions[tag])
    .filter(restriction => restriction?.isActive)
    .map(restriction => restriction?.description ?? '')

  if (activeRestrictions.length === 0) return

  pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.ACTIVE_RESTRICTIONS(activeRestrictions))
}

/**
 * Обрабатывает ROOMSTATE: логирует режимы комнаты и обновляет статус доступа.
 */
const handleRoomState = (
  message: ParsedIrcMessage,
  currentRoomTags: Record<string, string>,
  updateChatAccessStatus: (status: ChatAccessStatus) => void,
  pushStatusLog: PushStatusLog,
): void => {
  const tags = message.tags || {}

  logRoomStateRestrictions(tags, parseRoomStateRestrictions(tags), pushStatusLog)

  const isRestricted = checkIsRoomRestricted({ ...message, tags: currentRoomTags })

  updateChatAccessStatus(isRestricted ? TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED : TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
}

/**
 * Обрабатывает NOTICE с ошибкой отправки сообщения.
 */
const handleSendErrorNotice = (
  sendError: ChatSendErrorInfo,
  pendingMessagesRef: RefObject<PendingChatMessage[]>,
  updateChatAccessStatus: (status: ChatAccessStatus) => void,
  pushStatusLog: PushStatusLog,
): void => {
  pushStatusLog(sendError.logMessage)

  if (sendError.status) {
    updateChatAccessStatus(sendError.status)
  }

  rejectPendingMessages(pendingMessagesRef, sendError.logMessage, sendError.rejectsAllPending)
}

/**
 * Обрабатывает NOTICE: ошибки отправки, неизвестные ошибки и служебные уведомления.
 */
const handleNotice = (
  message: ParsedIrcMessage,
  pendingMessagesRef: RefObject<PendingChatMessage[]>,
  updateChatAccessStatus: (status: ChatAccessStatus) => void,
  pushStatusLog: PushStatusLog,
): void => {
  const msgId = message.tags?.[TWITCH_IRC_TAGS.MSG_ID]
  const sendError = getChatSendError(msgId)

  if (sendError) {
    handleSendErrorNotice(sendError, pendingMessagesRef, updateChatAccessStatus, pushStatusLog)
    return
  }

  if (isUnknownChatSendError(msgId)) {
    const unknownErrorMessage = TWITCH_CHAT_ACCESS_LOG_MESSAGES.UNKNOWN_SEND_ERROR(msgId)

    pushStatusLog(unknownErrorMessage)
    rejectPendingMessages(pendingMessagesRef, unknownErrorMessage, false)
    return
  }

  if (isTwitchAuthFailureNotice(message)) {
    rejectPendingMessages(pendingMessagesRef, TWITCH_CHAT_ACCESS_LOG_MESSAGES.AUTH_FAILED, true)
    return
  }

  pendingMessagesRef.current.shift()
}

/**
 * Обрабатывает CLEARCHAT: бан и таймаут собственного аккаунта.
 */
const handleClearChat = (
  message: ParsedIrcMessage,
  currentUserLogin: string | undefined,
  pendingMessagesRef: RefObject<PendingChatMessage[]>,
  timeoutTimerRef: RefObject<ReturnType<typeof setTimeout> | null>,
  updateChatAccessStatus: (status: ChatAccessStatus) => void,
  pushStatusLog: PushStatusLog,
): void => {
  const targetUser = message.text?.trim()?.toLowerCase()

  if (!targetUser || targetUser !== currentUserLogin) return

  const durationStr = message.tags?.[TWITCH_IRC_TAGS.BAN_DURATION]

  if (timeoutTimerRef.current) {
    clearTimeout(timeoutTimerRef.current)
    timeoutTimerRef.current = null
  }

  if (!durationStr) {
    pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.BAN_PERMANENT)
    updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.BANNED)
    rejectPendingMessages(pendingMessagesRef, TWITCH_CHAT_ACCESS_LOG_MESSAGES.BAN_PERMANENT, true)
    return
  }

  const durationSeconds = parseInt(durationStr, 10)

  if (isNaN(durationSeconds) || durationSeconds <= 0) {
    pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.BAN_INVALID_TIMEOUT)
    updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.BANNED)
    rejectPendingMessages(pendingMessagesRef, TWITCH_CHAT_ACCESS_LOG_MESSAGES.BAN_INVALID_TIMEOUT, true)
    return
  }

  const reason = TWITCH_CHAT_ACCESS_LOG_MESSAGES.TIMEOUT(durationStr)

  pushStatusLog(reason)
  updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED)
  rejectPendingMessages(pendingMessagesRef, reason, true)

  timeoutTimerRef.current = setTimeout(() => {
    pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.TIMEOUT_EXPIRED)
    updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
    timeoutTimerRef.current = null
  }, durationSeconds * 1000)
}

/**
 * Обрабатывает USERSTATE: снимает таймаут и подтверждает доступ к чату.
 */
const handleUserState = (
  timeoutTimerRef: RefObject<ReturnType<typeof setTimeout> | null>,
  updateChatAccessStatus: (status: ChatAccessStatus) => void,
  pushStatusLog: PushStatusLog,
): void => {
  if (timeoutTimerRef.current) {
    clearTimeout(timeoutTimerRef.current)
    timeoutTimerRef.current = null
    pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.RESTRICTION_REMOVED)
  }

  updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
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
  const pushStatusLog: PushStatusLog = (logMessage: string) => {
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source: APP_LOG_SOURCES.APPLICATION, actorUsername: APP_LOG_TWITCH_ACTOR })
  }

  if (message.command === TWITCH_IRC_COMMANDS.ROOM_STATE) {
    handleRoomState(message, currentRoomTags, updateChatAccessStatus, pushStatusLog)
    return
  }

  if (message.command === TWITCH_IRC_COMMANDS.NOTICE) {
    handleNotice(message, pendingMessagesRef, updateChatAccessStatus, pushStatusLog)
    return
  }

  if (message.command === TWITCH_IRC_COMMANDS.CLEAR_CHAT) {
    handleClearChat(message, currentUserLogin, pendingMessagesRef, timeoutTimerRef, updateChatAccessStatus, pushStatusLog)
    return
  }

  if (message.command !== TWITCH_IRC_COMMANDS.USER_STATE) return

  handleUserState(timeoutTimerRef, updateChatAccessStatus, pushStatusLog)
}
