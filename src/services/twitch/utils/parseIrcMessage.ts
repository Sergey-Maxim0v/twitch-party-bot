import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import { TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import { formatTimeWithSeconds } from '../../../utils/dateTime.ts'
import type { IrcUserData, ParsedIrcMessage, TwitchIrcCommandType } from '../types.ts'

/**
 * Парсит сырую строку от Twitch IRC в структурированный объект.
 * @param rawMessage - Сырая строка IRC-сообщения.
 * @returns Распарсенное сообщение или null, если строка имеет неверный формат.
 */
export const parseIrcMessage = (rawMessage: string): ParsedIrcMessage | null => {
  if (!rawMessage) return null

  let remaining = rawMessage.trim()
  const tags: Record<string, string> = {}

  if (remaining.startsWith('@')) {
    const spaceIndex = remaining.indexOf(' ')
    if (spaceIndex === -1) return null

    const tagsPart = remaining.slice(1, spaceIndex)
    remaining = remaining.slice(spaceIndex + 1)

    const pairs = tagsPart.split(';')

    for (const pair of pairs) {
      const eqIndex = pair.indexOf('=')
      if (eqIndex === -1) continue

      const key = pair.slice(0, eqIndex)
      if (!key) continue

      // Декодируем спецсимволы по спецификации Twitch IRC
      const rawValue = pair.slice(eqIndex + 1)

      tags[key] = rawValue
        .replace(/\\s/g, ' ')
        .replace(/\\:/g, ':')
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\\\/g, '\\')
    }
  }

  let userNickName = ''
  if (remaining.startsWith(':')) {
    const spaceIndex = remaining.indexOf(' ')
    if (spaceIndex === -1) return null

    const prefix = remaining.slice(1, spaceIndex)
    remaining = remaining.slice(spaceIndex + 1)

    const exclamationIndex = prefix.indexOf('!')
    userNickName = exclamationIndex !== -1 ? prefix.slice(0, exclamationIndex) : prefix
  }

  const colonIndex = remaining.indexOf(' :')
  let commandPart = remaining
  let text = ''

  if (colonIndex !== -1) {
    commandPart = remaining.slice(0, colonIndex)
    text = remaining.slice(colonIndex + 2)
  } else {
    // Для команд без текста (например, CLEARCHAT всего чата) сохраняем цель команды
    const parts = remaining.split(' ')
    if (parts.length > 2 && (parts[0] === TWITCH_IRC_COMMANDS.CLEAR_CHAT || parts[0] === TWITCH_IRC_COMMANDS.CLEAR_MSG)) {
      commandPart = parts.slice(0, 2).join(' ')
    }
  }

  const commandParts = commandPart.split(' ')
  const command = (commandParts[0] || '') as TwitchIrcCommandType

  if ((command === TWITCH_IRC_COMMANDS.CLEAR_CHAT || command === TWITCH_IRC_COMMANDS.CLEAR_MSG) && !text && commandParts[2]) {
    text = commandParts[2]
  }

  const id = tags.id || tags[TWITCH_IRC_TAGS.MSG_ID] || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  const rawTimestamp = tags['tmi-sent-ts'] ? parseInt(tags['tmi-sent-ts'], 10) : Date.now()
  const timestamp = formatTimeWithSeconds(rawTimestamp)

  const isSystem =
    tags[TWITCH_IRC_TAGS.IS_SYSTEM] === '1' ||
      command === TWITCH_IRC_COMMANDS.NOTICE ||
      command === TWITCH_IRC_COMMANDS.ROOM_STATE ||
      command === TWITCH_IRC_COMMANDS.USER_NOTICE ||
      command === TWITCH_IRC_COMMANDS.CLEAR_CHAT ||
      command === TWITCH_IRC_COMMANDS.CLEAR_MSG ||
      command === TWITCH_IRC_COMMANDS.RECONNECT

  const isChannelEvent = isSystem ||
      command === TWITCH_IRC_COMMANDS.GLOBAL_USER_STATE ||
      command === TWITCH_IRC_COMMANDS.MOTD_START

  const userId: IrcUserData['userId'] = tags['user-id'] || ''

  const badgeList = (tags.badges || '').split(',')

  const isBroadcaster: IrcUserData['isBroadcaster'] = badgeList.some(b => b.startsWith('broadcaster/'))
  const isModerator: IrcUserData['isModerator'] = badgeList.some(b => b.startsWith('moderator/')) || tags.mod === '1'
  const isVip: IrcUserData['isVip'] = tags.vip === '1' || badgeList.some(b => b.startsWith('vip/'))

  const isSubscriber: IrcUserData['isSubscriber'] = tags.subscriber === '1' || badgeList.some(b => b.startsWith('subscriber/')) || badgeList.some(b => b.startsWith('founder/'))
  const isTwitchStaff: IrcUserData['isTwitchStaff'] = badgeList.some(b => b.startsWith('staff/')) || badgeList.some(b => b.startsWith('admin/')) || tags['user-type'] === 'staff' || tags['user-type'] === 'admin'

  const color: IrcUserData['color'] = tags.color || ''

  const user: ParsedIrcMessage['user'] = {
    userId,
    nick: userNickName,
    displayName: tags[TWITCH_IRC_TAGS.DISPLAY_NAME] || undefined,
    isBroadcaster,
    isModerator,
    isVip,
    isSubscriber,
    isTwitchStaff,
    color,
  }

  const isDeleted = tags[TWITCH_IRC_TAGS.IS_DELETED] === '1'
  const isHighlightedMessage = tags[TWITCH_IRC_TAGS.MSG_ID] === 'highlighted-message'

  return { id, user, text, command, timestamp, isSystem, isChannelEvent, tags, isDeleted, isHighlightedMessage }
}
