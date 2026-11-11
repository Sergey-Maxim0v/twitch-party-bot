import { TWITCH_CHAT_ACCESS_STATUSES } from '../../../constants/socket.constants.ts'
import type { ChatAccessStatus } from '../../socket/types.ts'

/**
 * Ошибка отправки сообщения из NOTICE.
 */
export interface ChatSendErrorInfo {
  /** Статус доступа к чату, если ошибка блокирует отправку. */
  status?: ChatAccessStatus;

  /** Текст записи в журнале приложения. */
  logMessage: string;

  /** Снимать ли всю очередь сообщений. */
  rejectsAllPending: boolean;
}

/**
 * Ошибки отправки сообщений Twitch IRC.
 *
 * @see https://dev.twitch.tv/docs/chat/irc#notice
 */
export const TWITCH_CHAT_SEND_ERRORS: Record<string, ChatSendErrorInfo> = {
  msg_banned: {
    status: TWITCH_CHAT_ACCESS_STATUSES.BANNED,
    logMessage: 'Ошибка отправки сообщения: аккаунт забанен на канале.',
    rejectsAllPending: true,
  },
  msg_channel_blocked: {
    status: TWITCH_CHAT_ACCESS_STATUSES.BANNED,
    logMessage: 'Ошибка отправки сообщения: аккаунт заблокирован на канале.',
    rejectsAllPending: true,
  },
  msg_suspended: {
    status: TWITCH_CHAT_ACCESS_STATUSES.BANNED,
    logMessage: 'Ошибка отправки сообщения: учётная запись Twitch приостановлена.',
    rejectsAllPending: true,
  },
  msg_channel_suspended: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: канал приостановлен или недоступен.',
    rejectsAllPending: true,
  },
  msg_timedout: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: аккаунт получил таймаут.',
    rejectsAllPending: true,
  },
  msg_subsonly: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: чат доступен только подписчикам.',
    rejectsAllPending: true,
  },
  msg_followersonly: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: чат доступен только фолловерам.',
    rejectsAllPending: true,
  },
  msg_followersonly_followed: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: нужно дольше следить за каналом.',
    rejectsAllPending: true,
  },
  msg_followersonly_zero: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: для отправки нужно подписаться на канал.',
    rejectsAllPending: true,
  },
  msg_emoteonly: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: в чате включён режим «только смайлы».',
    rejectsAllPending: true,
  },
  msg_r9k: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: в чате включён режим уникальных сообщений.',
    rejectsAllPending: true,
  },
  msg_slowmode: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: в чате включён медленный режим.',
    rejectsAllPending: false,
  },
  msg_requires_verified_phone_number: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: требуется подтверждённый номер телефона.',
    rejectsAllPending: true,
  },
  msg_verified_email: {
    status: TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED,
    logMessage: 'Ошибка отправки сообщения: требуется подтверждённая почта.',
    rejectsAllPending: true,
  },
  msg_bad_characters: {
    logMessage: 'Ошибка отправки сообщения: сообщение содержит недопустимые символы.',
    rejectsAllPending: false,
  },
  msg_duplicate: {
    logMessage: 'Ошибка отправки сообщения: повторяющееся сообщение.',
    rejectsAllPending: false,
  },
  msg_ratelimit: {
    logMessage: 'Ошибка отправки сообщения: превышен лимит отправки сообщений.',
    rejectsAllPending: false,
  },
  msg_rejected: {
    logMessage: 'Ошибка отправки сообщения: сообщение отклонено модерацией.',
    rejectsAllPending: false,
  },
  msg_rejected_mandatory: {
    logMessage: 'Ошибка отправки сообщения: сообщение отклонено обязательными фильтрами канала.',
    rejectsAllPending: false,
  },
}

/**
 * Служебные NOTICE, не являющиеся ошибками отправки.
 */
const TWITCH_INFO_NOTICE_IDS = new Set([
  'room_subs_on', 'room_subs_off',
  'room_emoteonly_on', 'room_emoteonly_off',
  'msg_emote_only', 'msg_emote_only_off',
  'room_r9k_on', 'room_r9k_off',
  'msg_r9k_on', 'msg_r9k_off',
  'followers_on', 'followers_off',
  'msg_followers_on', 'msg_followers_off',
  'slow_on', 'slow_off',
  'msg_slow_on', 'msg_slow_off',
])

/**
 * Возвращает описание известной ошибки отправки.
 */
export const getChatSendError = (msgId?: string): ChatSendErrorInfo | undefined => (
  msgId ? TWITCH_CHAT_SEND_ERRORS[msgId] : undefined
)

/**
 * Проверяет, является ли NOTICE неизвестной ошибкой отправки.
 */
export const isUnknownChatSendError = (msgId?: string): boolean => (
  Boolean(msgId?.startsWith('msg_')) && !TWITCH_INFO_NOTICE_IDS.has(msgId as string)
)
