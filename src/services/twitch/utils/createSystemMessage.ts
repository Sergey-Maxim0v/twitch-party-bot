import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import { TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'
import { isRoomStateInitialization, parseRoomStateRestrictions, ROOM_STATE_MESSAGE_PRIORITY } from './roomState.ts'

/**
 * Создает структурированное системное сообщение на основе служебных команд Twitch.
 * @param message - Входящее IRC-сообщение.
 * @returns Системное сообщение или null, если команда не является системной.
 */
export const createSystemMessage = (message: ParsedIrcMessage): ParsedIrcMessage | null => {
  const { command, text, tags, timestamp } = message

  const buildSystemPayload = (systemText: string): ParsedIrcMessage => ({
    id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    user: {
      nick: 'система',
      displayName: 'Система',
    },
    text: systemText,
    command,
    timestamp,
    tags: { [TWITCH_IRC_TAGS.IS_SYSTEM]: '1', ...tags },
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

  // Подписки, рейды, подарки и важные события канала
  if (command === TWITCH_IRC_COMMANDS.USER_NOTICE) {
    const msgId = tags[TWITCH_IRC_TAGS.MSG_ID]
    const login = tags[TWITCH_IRC_TAGS.DISPLAY_NAME] || tags.login || 'Пользователь'
    const userMessage = text?.trim() ? `: "${text.trim()}"` : ''

    if (msgId === 'sub' || msgId === 'resub') {
      const months = tags['msg-param-cumulative-months'] || '1'
      return buildSystemPayload(`@${login} оформляет подписку! Всего месяцев: ${months}${userMessage}`)
    }

    if (msgId === 'subgift' || msgId === 'anonsubgift') {
      const recipient = tags['msg-param-recipient-display-name'] || tags['msg-param-recipient-user-name'] || 'зрителю'
      return buildSystemPayload(`@${login} дарит подписку пользователю @${recipient}!`)
    }

    if (msgId === 'submysterygift') {
      const massGiftCount = tags['msg-param-mass-gift-count'] || '1'
      return buildSystemPayload(`@${login} дарит ${massGiftCount} подписок сообществу канала!`)
    }

    if (msgId === 'bitsbadgetier') {
      return buildSystemPayload(`@${login} получил новый значок за общее количество потраченных Bits!`)
    }

    if (msgId === 'raid') {
      const viewerCount = tags['msg-param-viewerCount'] || '0'
      return buildSystemPayload(`Канал @${login} устраивает рейд и приводит ${viewerCount} зрителей!`)
    }

    if (msgId === 'viewermilestone') {
      const value = tags['msg-param-value'] || '1'
      return buildSystemPayload(`@${login} отмечает серию просмотров: ${value} трансляций подряд!`)
    }

    if (msgId === 'announcement') {
      return {
        id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user: {
          nick: 'объявление',
          displayName: 'Объявление',
        },
        text: `@${login}: ${text}`,
        command,
        timestamp,
        isSystem: true,
        isChannelEvent: true,
        isAnnouncement: true,
        tags: { [TWITCH_IRC_TAGS.IS_SYSTEM]: '1', [TWITCH_IRC_TAGS.IS_ANNOUNCEMENT]: 'announcement', ...tags },
      }
    }

    if (text) {
      return buildSystemPayload(`Уведомление от @${login}: ${text}`)
    }
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

    // Дублирующие английские уведомления о режимах комнаты игнорируем
    const roomStateNoticeIds = [
      'room_subs_on', 'room_subs_off',
      'room_emoteonly_on', 'room_emoteonly_off',
      'msg_emote_only', 'msg_emote_only_off',
      'room_r9k_on', 'room_r9k_off',
      'msg_r9k_on', 'msg_r9k_off',
      'followers_on', 'followers_off',
      'msg_followers_on', 'msg_followers_off',
      'slow_on', 'slow_off',
      'msg_slow_on', 'msg_slow_off',
    ]

    // Резервная фильтрация по тексту на случай пустого msg-id
    const isEnglishDuplicate =
      cleanText.includes('This room is now in emote-only mode') ||
        cleanText.includes('This room is no longer in emote-only mode') ||
        cleanText.includes('This room is now in subscribers-only mode') ||
        cleanText.includes('This room is no longer in subscribers-only mode') ||
        cleanText.includes('This room is now in followers-only mode') ||
        cleanText.includes('This room is no longer in followers-only mode') ||
        cleanText.includes('This room is now in slow mode') ||
        cleanText.includes('This room is no longer in slow mode')

    if (roomStateNoticeIds.includes(msgId) || isEnglishDuplicate) {
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
