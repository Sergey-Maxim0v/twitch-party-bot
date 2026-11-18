import type { RefObject } from 'react'
import { APP_LOG_TWITCH_ACTOR } from '../../../constants/app-logs.constants.ts'
import { TWITCH_CHAT_ACCESS_LOG_MESSAGES, TWITCH_IRC_COMMANDS, TWITCH_IRC_TAGS, TWITCH_MILLISECONDS_IN_SECOND } from '../../../constants/twitch.constants.ts'
import { APP_LOG_SOURCES, APP_LOG_STATUSES, type AppLogItem } from '../../../features/app-logs/types.ts'
import { TWITCH_CHAT_ACCESS_STATUSES } from '../../socket/types.ts'
import type { ChatAccessFacts, ParsedIrcMessage, PendingChatMessage } from '../types.ts'
import { checkIsRoomRestricted } from './checkIsRoomRestricted.ts'
import { getChatSendError, isUnknownChatSendError, type ChatSendErrorInfo } from './chatSendErrors.ts'
import { isTwitchAuthFailureNotice } from './isTwitchAuthFailureNotice.ts'
import { rejectPendingMessages } from './rejectPendingMessages.ts'
import {
  isRoomStateInitialization,
  parseRoomStateRestrictions,
  ROOM_STATE_LOG_PRIORITY,
  ROOM_STATE_SUMMARY_PRIORITY,
  type RoomStateRestrictions,
} from './roomState.ts'

/** Записывает событие доступа к чату в журнал приложения. */
type PushStatusLog = (logMessage: string) => void

/**
 * Общий контекст обработчиков доступа к чату.
 */
interface ChatAccessContext {
  /** Факты доступа к чату. */
  facts: ChatAccessFacts;

  /** Очередь сообщений, ожидающих подтверждения USERSTATE. */
  pendingMessagesRef: RefObject<PendingChatMessage[]>;

  /** Сбрасывает таймер снятия ограничений. */
  clearChatTimeout: () => void;

  /** Взводит таймер снятия ограничений, заменяя ранее запущенный. */
  startChatTimeout: (durationMs: number, onExpire: () => void) => void;

  /** Публикует статус, выведенный из актуальных фактов. */
  syncStatus: () => void;

  /** Записывает событие в журнал приложения. */
  pushStatusLog: PushStatusLog;
}

interface UpdateChatAccessProps {
  message: ParsedIrcMessage;
  currentUserLogin?: string;
  pendingMessagesRef: RefObject<PendingChatMessage[]>;
  factsRef: RefObject<ChatAccessFacts>;
  clearChatTimeout: () => void;
  startChatTimeout: (durationMs: number, onExpire: () => void) => void;
  syncStatus: () => void;
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
 * Применяет ROOMSTATE: накапливает теги комнаты и публикует статус по ним.
 */
const handleRoomState = (
  message: ParsedIrcMessage,
  context: ChatAccessContext,
): void => {
  const tags = message.tags || {}

  logRoomStateRestrictions(tags, parseRoomStateRestrictions(tags), context.pushStatusLog)

  context.facts.roomTags = { ...context.facts.roomTags, ...tags }
  context.facts.isSendBlocked = false

  context.syncStatus()
}

/**
 * Фиксирует бан: снимает таймаут и блокирует отправку до переподключения.
 */
const markBanned = (context: ChatAccessContext): void => {
  context.facts.isBanned = true
  context.facts.isTimeoutActive = false
  context.facts.isSendBlocked = false
  context.clearChatTimeout()
}

/**
 * Применяет бан: фиксирует факт, логирует причину и снимает очередь неподтверждённых сообщений.
 */
const applyBan = (
  context: ChatAccessContext,
  reason: string,
): void => {
  markBanned(context)
  context.pushStatusLog(reason)
  context.syncStatus()
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

  if (status === TWITCH_CHAT_ACCESS_STATUSES.BANNED) markBanned(context)
  if (status === TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED) context.facts.isSendBlocked = true
  if (status) context.syncStatus()

  rejectPendingMessages(context.pendingMessagesRef, sendError.logMessage, sendError.rejectsAllPending)
}

/**
 * Обрабатывает NOTICE: ошибки отправки, неизвестные ошибки и отказ в авторизации.
 *
 * Служебные уведомления о режимах комнаты очередь не затрагивают:
 * они не означают, что отправленное сообщение не доставлено.
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
  }
}

/**
 * Взводит таймер таймаута: по его истечении снимается только этот факт,
 * а ограничения комнаты и ошибки отправки продолжают удерживать статус.
 */
const armTimeoutTimer = (
  durationSeconds: number,
  context: ChatAccessContext,
): void => {
  context.facts.isTimeoutActive = true

  context.startChatTimeout(durationSeconds * TWITCH_MILLISECONDS_IN_SECOND, () => {
    context.facts.isTimeoutActive = false

    if (!checkIsRoomRestricted(context.facts.roomTags)) {
      context.pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.TIMEOUT_EXPIRED)
    }

    context.syncStatus()
  })
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

  const durationStr = message.tags?.[TWITCH_IRC_TAGS.BAN_DURATION] ?? ''
  const durationSeconds = parseInt(durationStr, 10)
  const isTimeoutBan = Number.isFinite(durationSeconds) && durationSeconds > 0

  if (!isTimeoutBan) {
    const reason = durationStr === ''
      ? TWITCH_CHAT_ACCESS_LOG_MESSAGES.BAN_PERMANENT
      : TWITCH_CHAT_ACCESS_LOG_MESSAGES.BAN_INVALID_TIMEOUT

    applyBan(context, reason)
    return
  }

  const reason = TWITCH_CHAT_ACCESS_LOG_MESSAGES.TIMEOUT(durationStr)

  context.pushStatusLog(reason)
  context.facts.isSendBlocked = false
  armTimeoutTimer(durationSeconds, context)
  context.syncStatus()
  rejectPendingMessages(context.pendingMessagesRef, reason, true)
}

/**
 * Обрабатывает USERSTATE: отправка подтверждена, поэтому снимаются таймаут,
 * запрет по NOTICE и отметка о бане.
 */
const handleUserState = (
  context: ChatAccessContext,
): void => {
  const wasTimeoutActive = context.facts.isTimeoutActive

  context.facts.isBanned = false
  context.facts.isTimeoutActive = false
  context.facts.isSendBlocked = false
  context.clearChatTimeout()

  if (wasTimeoutActive) context.pushStatusLog(TWITCH_CHAT_ACCESS_LOG_MESSAGES.RESTRICTION_REMOVED)

  context.syncStatus()
}

/**
 * Обновляет факты доступа к чату и публикует статус по входящим IRC-событиям Twitch.
 */
export const updateChatAccess = ({
  message,
  currentUserLogin,
  pendingMessagesRef,
  factsRef,
  clearChatTimeout,
  startChatTimeout,
  syncStatus,
  pushLog,
}: UpdateChatAccessProps): void => {
  const context: ChatAccessContext = {
    facts: factsRef.current,
    pendingMessagesRef,
    clearChatTimeout,
    startChatTimeout,
    syncStatus,
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

  if (message.command === TWITCH_IRC_COMMANDS.USER_STATE) handleUserState(context)
}
