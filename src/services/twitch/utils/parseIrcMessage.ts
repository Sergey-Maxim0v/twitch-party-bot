import {
  TWITCH_IRC_BADGE_PREFIXES,
  TWITCH_IRC_COMMANDS,
  TWITCH_IRC_FALLBACK_ID,
  TWITCH_IRC_HIGHLIGHTED_MSG_ID,
  TWITCH_IRC_TAG_ENABLED,
  TWITCH_IRC_TAGS,
  TWITCH_IRC_USER_TYPES,
} from '../../../constants/twitch.constants.ts'
import { formatTimeWithSeconds } from '../../../utils/dateTime.ts'
import type { ParsedIrcMessage, TwitchIrcCommandType } from '../types.ts'

/**
 * Команды, текст которых содержит цель удаления (ник или ID сообщения).
 */
const CLEAR_COMMANDS = new Set<string>([
  TWITCH_IRC_COMMANDS.CLEAR_CHAT,
  TWITCH_IRC_COMMANDS.CLEAR_MSG,
])

/**
 * Декодирует спецсимволы значения IRC-тега по спецификации Twitch.
 *
 * @param rawValue - Значение тега без разделителя.
 * @returns Значение с раскрытыми спецсимволами.
 */
const decodeTagValue = (rawValue: string): string => (
  rawValue
    .replace(/\\s/g, ' ')
    .replace(/\\:/g, ':')
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\')
)

/**
 * Разбирает теги IRC-сообщения вида `@key=value;key2=value2`.
 *
 * @param rawMessage - Сырая строка IRC-сообщения.
 * @returns Теги и остаток сообщения либо null, если формат тегов некорректен.
 */
const parseIrcTags = (rawMessage: string): { tags: Record<string, string>; rest: string } | null => {
  if (!rawMessage.startsWith('@')) return { tags: {}, rest: rawMessage }

  const spaceIndex = rawMessage.indexOf(' ')
  if (spaceIndex === -1) return null

  const tags: Record<string, string> = {}
  const pairs = rawMessage.slice(1, spaceIndex).split(';')

  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=')
    if (eqIndex === -1) continue

    const key = pair.slice(0, eqIndex)
    if (!key) continue

    tags[key] = decodeTagValue(pair.slice(eqIndex + 1))
  }

  return { tags, rest: rawMessage.slice(spaceIndex + 1) }
}

/**
 * Разбирает префикс автора вида `:nickname!user@host`.
 *
 * @param rawMessage - Сырая строка IRC-сообщения.
 * @returns Никнейм и остаток сообщения либо null, если формат префикса некорректен.
 */
const parseIrcPrefix = (rawMessage: string): { nick: string; rest: string } | null => {
  if (!rawMessage.startsWith(':')) return { nick: '', rest: rawMessage }

  const spaceIndex = rawMessage.indexOf(' ')
  if (spaceIndex === -1) return null

  const prefix = rawMessage.slice(1, spaceIndex)
  const exclamationIndex = prefix.indexOf('!')

  return {
    nick: exclamationIndex !== -1 ? prefix.slice(0, exclamationIndex) : prefix,
    rest: rawMessage.slice(spaceIndex + 1),
  }
}

/**
 * Отделяет команду IRC от ее текста.
 *
 * @param rawMessage - Остаток сообщения без тегов и префикса.
 * @returns Команда и текст сообщения.
 */
const parseCommandAndText = (rawMessage: string): { commandPart: string; text: string } => {
  const colonIndex = rawMessage.indexOf(' :')

  if (colonIndex !== -1) {
    return {
      commandPart: rawMessage.slice(0, colonIndex),
      text: rawMessage.slice(colonIndex + 2),
    }
  }

  // Для команд без текста (например, CLEARCHAT всего чата) сохраняем цель команды
  const parts = rawMessage.split(' ')
  const hasTarget = parts.length > 2 && CLEAR_COMMANDS.has(parts[0])

  return {
    commandPart: hasTarget ? parts.slice(0, 2).join(' ') : rawMessage,
    text: '',
  }
}

/**
 * Проверяет наличие бейджа с заданным префиксом.
 *
 * @param badges - Список бейджей сообщения.
 * @param prefix - Префикс искомого бейджа.
 * @returns `true`, если бейдж присутствует.
 */
const hasBadge = (badges: string[], prefix: string): boolean => (
  badges.some(badge => badge.startsWith(prefix))
)

/**
 * Парсит сырую строку от Twitch IRC в структурированный объект.
 *
 * @param rawMessage - Сырая строка IRC-сообщения.
 * @returns Распарсенное сообщение или null, если строка имеет неверный формат.
 */
export const parseIrcMessage = (rawMessage: string): ParsedIrcMessage | null => {
  if (!rawMessage) return null

  const parsedTags = parseIrcTags(rawMessage.trim())
  if (!parsedTags) return null

  const { tags } = parsedTags

  const parsedPrefix = parseIrcPrefix(parsedTags.rest)
  if (!parsedPrefix) return null

  const { commandPart, text: parsedText } = parseCommandAndText(parsedPrefix.rest)

  const commandParts = commandPart.split(' ')
  const command = (commandParts[0] || '') as TwitchIrcCommandType

  const text = !parsedText && CLEAR_COMMANDS.has(command) && commandParts[2]
    ? commandParts[2]
    : parsedText

  const id = tags[TWITCH_IRC_TAGS.ID]
    || tags[TWITCH_IRC_TAGS.MSG_ID]
    || `${Date.now()}-${Math.random().toString(TWITCH_IRC_FALLBACK_ID.RANDOM_RADIX).slice(TWITCH_IRC_FALLBACK_ID.RANDOM_START, TWITCH_IRC_FALLBACK_ID.RANDOM_END)}`

  const rawTimestamp = tags[TWITCH_IRC_TAGS.SENT_TIMESTAMP]
    ? parseInt(tags[TWITCH_IRC_TAGS.SENT_TIMESTAMP], 10)
    : Date.now()
  const timestamp = formatTimeWithSeconds(rawTimestamp)

  const isSystem = tags[TWITCH_IRC_TAGS.IS_SYSTEM] === TWITCH_IRC_TAG_ENABLED
    || command === TWITCH_IRC_COMMANDS.NOTICE
    || command === TWITCH_IRC_COMMANDS.ROOM_STATE
    || command === TWITCH_IRC_COMMANDS.USER_NOTICE
    || command === TWITCH_IRC_COMMANDS.CLEAR_CHAT
    || command === TWITCH_IRC_COMMANDS.CLEAR_MSG
    || command === TWITCH_IRC_COMMANDS.RECONNECT

  const isChannelEvent = isSystem
    || command === TWITCH_IRC_COMMANDS.GLOBAL_USER_STATE
    || command === TWITCH_IRC_COMMANDS.MOTD_START

  const badges = (tags[TWITCH_IRC_TAGS.BADGES] || '').split(',')

  const isBroadcaster = hasBadge(badges, TWITCH_IRC_BADGE_PREFIXES.BROADCASTER)
  const isModerator = hasBadge(badges, TWITCH_IRC_BADGE_PREFIXES.MODERATOR)
    || tags[TWITCH_IRC_TAGS.MOD] === TWITCH_IRC_TAG_ENABLED
  const isVip = tags[TWITCH_IRC_TAGS.VIP] === TWITCH_IRC_TAG_ENABLED
    || hasBadge(badges, TWITCH_IRC_BADGE_PREFIXES.VIP)
  const isSubscriber = tags[TWITCH_IRC_TAGS.SUBSCRIBER] === TWITCH_IRC_TAG_ENABLED
    || hasBadge(badges, TWITCH_IRC_BADGE_PREFIXES.SUBSCRIBER)
    || hasBadge(badges, TWITCH_IRC_BADGE_PREFIXES.FOUNDER)
  const isTwitchStaff = hasBadge(badges, TWITCH_IRC_BADGE_PREFIXES.STAFF)
    || hasBadge(badges, TWITCH_IRC_BADGE_PREFIXES.ADMIN)
    || tags[TWITCH_IRC_TAGS.USER_TYPE] === TWITCH_IRC_USER_TYPES.STAFF
    || tags[TWITCH_IRC_TAGS.USER_TYPE] === TWITCH_IRC_USER_TYPES.ADMIN

  const user: ParsedIrcMessage['user'] = {
    userId: tags[TWITCH_IRC_TAGS.USER_ID] || '',
    nick: parsedPrefix.nick,
    displayName: tags[TWITCH_IRC_TAGS.DISPLAY_NAME] || undefined,
    isBroadcaster,
    isModerator,
    isVip,
    isSubscriber,
    isTwitchStaff,
    color: tags[TWITCH_IRC_TAGS.COLOR] || '',
  }

  const isDeleted = tags[TWITCH_IRC_TAGS.IS_DELETED] === TWITCH_IRC_TAG_ENABLED
  const isHighlightedMessage = tags[TWITCH_IRC_TAGS.MSG_ID] === TWITCH_IRC_HIGHLIGHTED_MSG_ID

  return { id, user, text, command, timestamp, isSystem, isChannelEvent, tags, isDeleted, isHighlightedMessage }
}
