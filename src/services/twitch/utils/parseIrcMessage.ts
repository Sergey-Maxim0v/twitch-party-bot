import { TwitchIrcCommand, type TwitchIrcCommandType } from '../config.ts'
import type { IrcUserData, ParsedIrcMessage } from '../types.ts'

/**
 * Парсит сырую строку от Twitch IRC в структурированный объект.
 */
export const parseIrcMessage = (rawMessage: string): ParsedIrcMessage | null => {
  if (!rawMessage) return null

  let remaining = rawMessage.trim()
  const tags: Record<string, string> = {}

  // 1. Парсим теги, если они есть (начинаются с @)
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
      // Забираем всё, что идет после первого знака "=", сохраняя остальные "=" внутри значения
      const rawValue = pair.slice(eqIndex + 1)

      if (key) {
        // Полное декодирование спецсимволов по спецификации Twitch IRC
        tags[key] = rawValue
          .replace(/\\s/g, ' ')
          .replace(/\\:/g, ':')
          .replace(/\\r/g, '\r')
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '\\')
      }
    }
  }

  // 2. Ищем префикс источника (ник пользователя, начинается с ":")
  let userNickName = ''
  if (remaining.startsWith(':')) {
    const spaceIndex = remaining.indexOf(' ')
    if (spaceIndex === -1) return null

    const prefix = remaining.slice(1, spaceIndex)
    remaining = remaining.slice(spaceIndex + 1)

    // Извлекаем чистый никнейм из формата user!user@user.tmi.twitch.tv
    const exclamationIndex = prefix.indexOf('!')
    userNickName = exclamationIndex !== -1 ? prefix.slice(0, exclamationIndex) : prefix
  }

  // 3. Выделяем команду и текст сообщения
  const colonIndex = remaining.indexOf(' :')
  let commandPart = remaining
  let text = ''

  if (colonIndex !== -1) {
    commandPart = remaining.slice(0, colonIndex)
    text = remaining.slice(colonIndex + 2) // Всё, что после " :" — это текст сообщения
  } else {
    // Для команд без текста (например, CLEARCHAT всего чата)
    const parts = remaining.split(' ')
    if (parts.length > 2 && (parts[0] === TwitchIrcCommand.CLEAR_CHAT || parts[0] === TwitchIrcCommand.CLEAR_MSG)) {
      commandPart = parts.slice(0, 2).join(' ')
    }
  }

  const commandParts = commandPart.split(' ')
  const command = (commandParts[0] || '') as TwitchIrcCommandType

  // Для CLEARCHAT, безопасное извлечение цели бана/удаления сообщения из тегов или параметров команды
  if ((command === TwitchIrcCommand.CLEAR_CHAT || command === TwitchIrcCommand.CLEAR_MSG) && !text && commandParts[2]) {
    text = commandParts[2]
  }

  // Генерируем запасной id, если Twitch не прислал его в тегах для этой команды
  const id = tags.id || tags['msg-id'] || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  // Извлекаем временную метку Twitch (tmi-sent-ts) или берем текущее время
  const rawTimestamp = tags['tmi-sent-ts'] ? parseInt(tags['tmi-sent-ts'], 10) : Date.now()
  const date = new Date(rawTimestamp)
  const timestamp = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // Вычисляем флаги на основе прочитанной команды
  const isSystem =
    tags['is-system'] === '1' ||
        command === TwitchIrcCommand.NOTICE ||
        command === TwitchIrcCommand.ROOM_STATE ||
        command === TwitchIrcCommand.USER_NOTICE ||
        command === TwitchIrcCommand.CLEAR_CHAT ||
        command === TwitchIrcCommand.CLEAR_MSG

  const isChannelEvent = isSystem ||
        command === TwitchIrcCommand.GLOBAL_USER_STATE ||
        command === TwitchIrcCommand.MOTD_START

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
    displayName: tags['display-name'] || undefined,
    isBroadcaster,
    isModerator,
    isVip,
    isSubscriber,
    isTwitchStaff,
    color,
  }

  const isDeleted = tags['is-deleted'] === '1'
  const isHighlightedMessage = tags['msg-id'] === 'highlighted-message'

  return { id, user, text, command, timestamp, isSystem, isChannelEvent, tags, isDeleted, isHighlightedMessage }
}
