import {
  TWITCH_ANNOUNCEMENT_AUTHOR,
  TWITCH_IRC_COMMANDS,
  TWITCH_IRC_MSG_IDS,
  TWITCH_IRC_MSG_PARAMS,
  TWITCH_IRC_TAG_ENABLED,
  TWITCH_IRC_TAGS,
  TWITCH_ROOM_STATE_NOTICE_IDS,
  TWITCH_ROOM_STATE_NOTICE_TEXTS,
  TWITCH_SYSTEM_MESSAGE_AUTHOR,
  TWITCH_SYSTEM_MESSAGE_ID,
} from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'
import { isRoomStateInitialization, parseRoomStateRestrictions, ROOM_STATE_MESSAGE_PRIORITY } from './roomState.ts'

/**
 * Создает локальный ID системного сообщения.
 *
 * @returns Уникальный идентификатор системного сообщения.
 */
const generateSystemMessageId = (): string => {
  const { PREFIX, RANDOM_END, RANDOM_RADIX, RANDOM_START } = TWITCH_SYSTEM_MESSAGE_ID
  return `${PREFIX}${Date.now()}-${Math.random().toString(RANDOM_RADIX).substring(RANDOM_START, RANDOM_END)}`
}

/**
 * Создает структурированное системное сообщение на основе служебных команд Twitch.
 *
 * @param message - Входящее IRC-сообщение.
 * @returns Системное сообщение или null, если команда не является системной.
 */
export const createSystemMessage = (message: ParsedIrcMessage): ParsedIrcMessage | null => {
  const { command, text, tags, timestamp } = message

  const buildSystemPayload = (systemText: string): ParsedIrcMessage => ({
    id: generateSystemMessageId(),
    user: {
      nick: TWITCH_SYSTEM_MESSAGE_AUTHOR.NICK,
      displayName: TWITCH_SYSTEM_MESSAGE_AUTHOR.DISPLAY_NAME,
    },
    text: systemText,
    command,
    timestamp,
    tags: { [TWITCH_IRC_TAGS.IS_SYSTEM]: TWITCH_IRC_TAG_ENABLED, ...tags },
    isSystem: true,
    isChannelEvent: true,
  })

  if (command === TWITCH_IRC_COMMANDS.CLEAR_CHAT) {
    const bannedUser = text?.trim()

    if (!bannedUser) {
      return buildSystemPayload('Чат был очищен модератором.')
    }

    const duration = tags[TWITCH_IRC_TAGS.BAN_DURATION]
    const actionText = duration
      ? `Пользователь @${bannedUser} заблокирован на ${duration} сек.`
      : `Пользователь @${bannedUser} забанен навсегда.`

    return buildSystemPayload(actionText)
  }

  if (command === TWITCH_IRC_COMMANDS.CLEAR_MSG) {
    const targetUser = tags.login || 'Пользователь'
    return buildSystemPayload(`Сообщение от @${targetUser} удалено.`)
  }

  if (command === TWITCH_IRC_COMMANDS.USER_NOTICE) {
    return createUserNoticeMessage(message, buildSystemPayload)
  }

  if (command === TWITCH_IRC_COMMANDS.ROOM_STATE) {
    // Стартовый пакет инициализации комнаты не выводим в чат
    if (isRoomStateInitialization(tags)) {
      return null
    }

    const restrictions = parseRoomStateRestrictions(tags)

    const changedRestriction = ROOM_STATE_MESSAGE_PRIORITY
      .map(tag => restrictions[tag])
      .find(restriction => restriction !== undefined)

    if (changedRestriction) {
      return buildSystemPayload(changedRestriction.message)
    }
  }

  if (command === TWITCH_IRC_COMMANDS.NOTICE) {
    const msgId = tags[TWITCH_IRC_TAGS.MSG_ID] || ''
    const cleanText = text?.trim() || ''

    const isEnglishDuplicate = TWITCH_ROOM_STATE_NOTICE_TEXTS.some(notice => cleanText.includes(notice))

    if (TWITCH_ROOM_STATE_NOTICE_IDS.includes(msgId) || isEnglishDuplicate) {
      return null
    }

    return buildSystemPayload(text || 'Произошла системная ошибка выполнения команды чата.')
  }

  if (command === TWITCH_IRC_COMMANDS.GLOBAL_USER_STATE) {
    return buildSystemPayload('Глобальные метаданные учетной записи успешно синхронизированы с Twitch.')
  }

  if (command === TWITCH_IRC_COMMANDS.RECONNECT) {
    return buildSystemPayload('Получен системный запрос RECONNECT от сервера Twitch. Запускается процесс планового переподключения.')
  }

  return null
}

/**
 * Создает системное сообщение для команды USERNOTICE.
 *
 * @param message - Входящее IRC-сообщение.
 * @param buildSystemPayload - Сборщик системного сообщения.
 * @returns Системное сообщение или null, если событие не требует вывода в чат.
 */
const createUserNoticeMessage = (
  message: ParsedIrcMessage,
  buildSystemPayload: (systemText: string) => ParsedIrcMessage,
): ParsedIrcMessage | null => {
  const { command, text, tags, timestamp } = message

  const msgId = tags[TWITCH_IRC_TAGS.MSG_ID]
  const login = tags[TWITCH_IRC_TAGS.DISPLAY_NAME] || tags.login || 'Пользователь'
  const userMessage = text?.trim() ? `: "${text.trim()}"` : ''

  if (msgId === TWITCH_IRC_MSG_IDS.SUB || msgId === TWITCH_IRC_MSG_IDS.RESUB) {
    const months = tags[TWITCH_IRC_MSG_PARAMS.CUMULATIVE_MONTHS] || TWITCH_IRC_TAG_ENABLED
    return buildSystemPayload(`@${login} оформляет подписку! Всего месяцев: ${months}${userMessage}`)
  }

  if (msgId === TWITCH_IRC_MSG_IDS.SUBGIFT || msgId === TWITCH_IRC_MSG_IDS.ANONSUBGIFT) {
    const recipient = tags[TWITCH_IRC_MSG_PARAMS.RECIPIENT_DISPLAY_NAME] || tags[TWITCH_IRC_MSG_PARAMS.RECIPIENT_USER_NAME] || 'зрителю'
    return buildSystemPayload(`@${login} дарит подписку пользователю @${recipient}!`)
  }

  if (msgId === TWITCH_IRC_MSG_IDS.SUBMYSTERYGIFT) {
    const massGiftCount = tags[TWITCH_IRC_MSG_PARAMS.MASS_GIFT_COUNT] || TWITCH_IRC_TAG_ENABLED
    return buildSystemPayload(`@${login} дарит ${massGiftCount} подписок сообществу канала!`)
  }

  if (msgId === TWITCH_IRC_MSG_IDS.BITSBADGETIER) {
    return buildSystemPayload(`@${login} получил новый значок за общее количество потраченных Bits!`)
  }

  if (msgId === TWITCH_IRC_MSG_IDS.RAID) {
    const viewerCount = tags[TWITCH_IRC_MSG_PARAMS.VIEWER_COUNT] || '0'
    return buildSystemPayload(`Канал @${login} устраивает рейд и приводит ${viewerCount} зрителей!`)
  }

  if (msgId === TWITCH_IRC_MSG_IDS.VIEWERMILESTONE) {
    const value = tags[TWITCH_IRC_MSG_PARAMS.VALUE] || TWITCH_IRC_TAG_ENABLED
    return buildSystemPayload(`@${login} отмечает серию просмотров: ${value} трансляций подряд!`)
  }

  if (msgId === TWITCH_IRC_MSG_IDS.ANNOUNCEMENT) {
    return {
      id: generateSystemMessageId(),
      user: {
        nick: TWITCH_ANNOUNCEMENT_AUTHOR.NICK,
        displayName: TWITCH_ANNOUNCEMENT_AUTHOR.DISPLAY_NAME,
      },
      text: `@${login}: ${text}`,
      command,
      timestamp,
      isSystem: true,
      isChannelEvent: true,
      isAnnouncement: true,
      tags: { [TWITCH_IRC_TAGS.IS_SYSTEM]: TWITCH_IRC_TAG_ENABLED, [TWITCH_IRC_TAGS.IS_ANNOUNCEMENT]: TWITCH_IRC_MSG_IDS.ANNOUNCEMENT, ...tags },
    }
  }

  if (!text) return null

  return buildSystemPayload(`Уведомление от @${login}: ${text}`)
}
