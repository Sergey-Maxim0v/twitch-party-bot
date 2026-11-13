import type { RefObject } from 'react'
import { TWITCH_CHAT_ACCESS_LOG_MESSAGES, TWITCH_IRC_COMMANDS, TWITCH_IRC_TAGS, TWITCH_MILLISECONDS_IN_SECOND } from '../../../constants/twitch.constants.ts'
import { TWITCH_CHAT_ACCESS_STATUSES, type ChatAccessStatus } from '../../socket/types.ts'
import { checkIsRoomRestricted } from './checkIsRoomRestricted.ts'
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
import { clearChatTimeout } from './clearChatTimeout.ts'
import { APP_LOG_TWITCH_ACTOR } from '../../../constants/app-logs.constants.ts'

/** Записывает событие доступа к чату в журнал приложения. */
type PushStatusLog = (logMessage: string) => void

/**
 * Снимок актуального состояния доступа к чату.
 * Читается в момент проверки, чтобы не опираться на устаревшие данные.
 */
export interface ChatAccessSnapshot {
  /** Текущий статус доступа к чату. */
  status: ChatAccessStatus;

  /** Признак активного соединения с Twitch IRC. */
  isConnectionActive: boolean;

  /** Теги состояния комнаты, накопленные от последнего ROOMSTATE. */
  roomTags: Record<string, string>;
}

/**
 * Общий контекст обработчиков доступа к чату.
 */
interface ChatAccessContext {
  /** Очередь сообщений, ожидающих подтверждения USERSTATE. */
  pendingMessagesRef: RefObject<PendingChatMessage[]>;

  /** Ref с идентификатором активного таймера снятия ограничений. */
  timeoutTimerRef: RefObject<ReturnType<typeof setTimeout> | null>;

  /** Устанавливает статус доступа к чату. */
  updateChatAccessStatus: (status: ChatAccessStatus) => void;

  /** Возвращает актуальный снимок состояния доступа к чату. */
  getChatAccessSnapshot: () => ChatAccessSnapshot;

  /** Записывает событие в журнал приложения. */
  pushStatusLog: PushStatusLog;
}

interface UpdateChatAccessProps {
  message: ParsedIrcMessage;
  currentUserLogin?: string;
  pendingMessagesRef: RefObject<PendingChatMessage[]>;
  timeoutTimerRef: RefObject<ReturnType<typeof setTimeout> | null>;
  updateChatAccessStatus: (status: ChatAccessStatus) => void;
  getChatAccessSnapshot: () => ChatAccessSnapshot;
  pushLog: (log: {
    message: AppLogItem['message'];
    status?: AppLogItem['status'];
    source: AppLogItem['source'];
    actorUsername: AppLogItem['actorUsername'];
    rawCommand?: AppLogItem['rawCommand'];
  }) => void;
}

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
  context: ChatAccessContext,
): void => {
  const tags = message.tags || {}

  logRoomStateRestrictions(tags, parseRoomStateRestrictions(tags), context.pushStatusLog)

  const isRestricted = checkIsRoomRestricted(context.getChatAccessSnapshot().roomTags)

  context.updateChatAccessStatus(isRestricted ? TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED : TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
}

/**
 * Применяет бан: статус BANNED и снятие очереди неподтверждённых сообщений.
 */
const applyBan = (
  context: ChatAccessContext,
  reason: string,
): void => {
  context.pushStatusLog(reason)
  context.updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.BANNED)
  rejectPendingMessages(context.pendingMessagesRef, reason, true)
}

/**
 * Обрабатывает NOTICE с ошибкой отправки сообщения.
 */
const handleSendErrorNotice = (
  sendError: ChatSendErrorInfo,
  context: ChatAccessContext,
): void => {
  context.pushStatusLog(sendError.logMessage)

  const { status } = sendError

  if (status === TWITCH_CHAT_ACCESS_STATUSES.BANNED) {
    clearChatTimeout(context.timeoutTimerRef)
  }

  if (status) {
    context.updateChatAccessStatus(status)
  }

  rejectPendingMessages(context.pendingMessagesRef, sendError.logMessage, sendError.rejectsAllPending)
}

/**
 * Обрабатывает NOTICE: ошибки отправки, неизвестные ошибки и служебные уведомления.
 */
const handleNotice = (
  message: ParsedIrcMessage,
  context: ChatAccessContext,
): void => {
  const msgId = message.tags?.[TWITCH_IRC_TAGS.MSG_ID]
  const sendError = getChatSendError(msgId)

  if (sendError) {
    handleSendErrorNotice(sendError, context)
    return
  }

  if (isUnknownChatSendError(msgId)) {
    const unknownErrorMessage = TWITCH_CHAT_ACCESS_LOG_MESSAGES.UNKNOWN_SEND_ERROR(msgId)

    context.pushStatusLog(unknownErrorMessage)
    rejectPendingMessages(context.pendingMessagesRef, unknownErrorMessage, false)
    return
  }

  if (isTwitchAuthFailureNotice(message)) {
    rejectPendingMessages(context.pendingMessagesRef, TWITCH_CHAT_ACCESS_LOG_MESSAGES.AUTH_FAILED, true)
    return
  }

  context.pendingMessagesRef.current.shift()
}

/**
 * Взводит таймер снятия таймаута.
 *
 * Ограничение снимается, только если с момента выдачи таймаута его не сменило
 * другое событие: обрыв соединения, бан или режим комнаты.
 */
const armTimeoutTimer = (
  durationSeconds: number,
  context: ChatAccessContext,
): void => {
  context.timeoutTimerRef.current = setTimeout(() => {
    context.timeoutTimerRef.current = null

    const snapshot = context.getChatAccessSnapshot()

    if (!snapshot.isConnectionActive) return
    if (snapshot.status !== TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED) return
    if (checkIsRoomRestricted(snapshot.roomTags)) return

    context.pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.TIMEOUT_EXPIRED)
    context.updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
  }, durationSeconds * TWITCH_MILLISECONDS_IN_SECOND)
}

/**
 * Обрабатывает CLEARCHAT: бан и таймаут собственного аккаунта.
 */
const handleClearChat = (
  message: ParsedIrcMessage,
  currentUserLogin: string | undefined,
  context: ChatAccessContext,
): void => {
  const targetUser = message.text?.trim()?.toLowerCase()

  if (!targetUser || targetUser !== currentUserLogin) return

  const durationStr = message.tags?.[TWITCH_IRC_TAGS.BAN_DURATION]
  const durationSeconds = parseInt(durationStr ?? '', 10)

  clearChatTimeout(context.timeoutTimerRef)

  if (!durationStr) {
    applyBan(context, TWITCH_CHAT_ACCESS_LOG_MESSAGES.BAN_PERMANENT)
    return
  }

  if (isNaN(durationSeconds) || durationSeconds <= 0) {
    applyBan(context, TWITCH_CHAT_ACCESS_LOG_MESSAGES.BAN_INVALID_TIMEOUT)
    return
  }

  const reason = TWITCH_CHAT_ACCESS_LOG_MESSAGES.TIMEOUT(durationStr)

  context.pushStatusLog(reason)
  context.updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED)
  rejectPendingMessages(context.pendingMessagesRef, reason, true)

  armTimeoutTimer(durationSeconds, context)
}

/**
 * Обрабатывает USERSTATE: снимает таймаут и подтверждает доступ к чату.
 */
const handleUserState = (
  context: ChatAccessContext,
): void => {
  const wasTimeoutActive = clearChatTimeout(context.timeoutTimerRef)

  if (wasTimeoutActive) {
    context.pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.RESTRICTION_REMOVED)
  }

  context.updateChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.CONNECTED)
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
  getChatAccessSnapshot,
  pushLog,
}: UpdateChatAccessProps): void => {
  const context: ChatAccessContext = {
    pendingMessagesRef,
    timeoutTimerRef,
    updateChatAccessStatus,
    getChatAccessSnapshot,
    pushStatusLog: (logMessage: string) => {
      pushLog({
        message: logMessage,
        status: APP_LOG_STATUSES.ERROR,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername: APP_LOG_TWITCH_ACTOR,
      })
    },
  }

  if (message.command === TWITCH_IRC_COMMANDS.ROOM_STATE) {
    handleRoomState(message, context)
    return
  }

  if (message.command === TWITCH_IRC_COMMANDS.NOTICE) {
    handleNotice(message, context)
    return
  }

  if (message.command === TWITCH_IRC_COMMANDS.CLEAR_CHAT) {
    handleClearChat(message, currentUserLogin, context)
    return
  }

  if (message.command !== TWITCH_IRC_COMMANDS.USER_STATE) return

  handleUserState(context)
}
