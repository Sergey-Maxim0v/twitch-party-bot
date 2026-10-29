import { TwitchIrcCommand } from '../config.ts'
import type { ParsedIrcMessage } from '../types.ts'

/**
 * Создает структурированное системное сообщение на основе служебных команд Twitch.
 * Если команда не является системной, возвращает null.
 */
export const createSystemMessage = (message: ParsedIrcMessage): ParsedIrcMessage | null => {
  const { command, text, tags, timestamp } = message

  // Шаблон для генерации системного объекта
  const buildSystemPayload = (systemText: string): ParsedIrcMessage => ({
    id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    user: {
      nick: 'система',
      displayName: 'Система',
    },
    text: systemText,
    command,
    timestamp,
    tags: { 'is-system': '1', ...tags },
    isSystem: true,
    isChannelEvent: true,
  })

  // Полная очистка чата или бан/таймаут пользователя
  if (command === TwitchIrcCommand.CLEAR_CHAT) {
    const bannedUser = text?.trim()

    // Если текста нет — это полная очистка чата
    if (!bannedUser) {
      return buildSystemPayload('Чат был очищен модератором.')
    }

    // Если текст есть — это бан или тайм-аут
    const duration = tags['ban-duration']
    const actionText = duration
      ? `Пользователь @${bannedUser} заблокирован на ${duration} сек.`
      : `Пользователь @${bannedUser} забанен навсегда.`

    return buildSystemPayload(actionText)
  }

  // Удаление одного конкретного сообщения
  if (command === TwitchIrcCommand.CLEAR_MSG) {
    const targetUser = tags.login || 'Пользователь'
    return buildSystemPayload(`Сообщение от @${targetUser} удалено.`)
  }

  // Подписки, рейды, подарки и важные события канала
  if (command === TwitchIrcCommand.USER_NOTICE) {
    const msgId = tags['msg-id']
    const login = tags['display-name'] || tags.login || 'Пользователь'
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

    // Серия просмотров
    if (msgId === 'viewermilestone') {
      const value = tags['msg-param-value'] || '1'
      return buildSystemPayload(`@${login} отмечает серию просмотров: ${value} трансляций подряд!`)
    }

    // Объявление (анонс) от стримера или модератора
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
        tags: { 'is-system': '1', 'system-type': 'announcement', ...tags },
      }
    }

    if (text) {
      return buildSystemPayload(`Уведомление от @${login}: ${text}`)
    }
  }

  // Глобальные изменения режимов комнаты (ROOMSTATE)
  if (command === TwitchIrcCommand.ROOM_STATE) {
    // Если это стартовый пакет инициализации комнаты — полностью игнорируем вывод сообщения в чат
    const hasAllTags = tags['subs-only'] !== undefined && tags.slow !== undefined && tags['emote-only'] !== undefined

    if (hasAllTags) {
      return null
    }

    // Генерируем точечные системные сообщения для логов чата при их изменении
    if (tags['subs-only'] === '1') return buildSystemPayload('Включен режим "Только для подписчиков".')
    if (tags['subs-only'] === '0') return buildSystemPayload('Режим "Только для подписчиков" отключен.')

    if (tags['emote-only'] === '1') return buildSystemPayload('Включен режим "Только смайлы".')
    if (tags['emote-only'] === '0') return buildSystemPayload('Режим "Только смайлы" отключен.')

    if (tags['r9k'] === '1') return buildSystemPayload('Включен режим уникальных сообщений.')
    if (tags['r9k'] === '0') return buildSystemPayload('Режим уникальных сообщений отключен.')

    if (tags['followers-only'] && tags['followers-only'] !== '-1') {
      const minutes = parseInt(tags['followers-only'], 10)
      const followersText = minutes === 0 ? 'Включен режим "Только для фолловеров".' : `Включен режим "Только для фолловеров" (минимум ${minutes} мин.).`
      return buildSystemPayload(followersText)
    }
    if (tags['followers-only'] === '-1') return buildSystemPayload('Режим "Только для фолловеров" отключен.')

    if (tags.slow && tags.slow !== '0') return buildSystemPayload(`Включен медленный режим (${tags.slow} сек.).`)
    if (tags.slow === '0') return buildSystemPayload('Медленный режим отключен.')
  }

  // Обработка системных уведомлений и ошибок выполнения команд чата (NOTICE)
  if (command === TwitchIrcCommand.NOTICE) {
    const msgId = tags['msg-id'] || ''
    const cleanText = text?.trim() || ''

    // Фильтрация по идентификаторам тегов msg-id
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

    // Резервная сквозная фильтрация по тексту сообщения (на случай, если Twitch прислал пустой msg-id)
    const isEnglishDuplicate =
      cleanText.includes('This room is now in emote-only mode') ||
        cleanText.includes('This room is no longer in emote-only mode') ||
        cleanText.includes('This room is now in subscribers-only mode') ||
        cleanText.includes('This room is no longer in subscribers-only mode') ||
        cleanText.includes('This room is now in followers-only mode') ||
        cleanText.includes('This room is no longer in followers-only mode') ||
        cleanText.includes('This room is now in slow mode') ||
        cleanText.includes('This room is no longer in slow mode')

    // Полностью игнорируем дублирующие английские сообщения от NOTICE
    if (roomStateNoticeIds.includes(msgId) || isEnglishDuplicate) {
      return null
    }

    return buildSystemPayload(text || 'Произошла системная ошибка выполнения команды чата.')
  }

  // Глобальное состояние пользователя при авторизации
  if (command === TwitchIrcCommand.GLOBAL_USER_STATE) {
    return buildSystemPayload('Глобальные метаданные учетной записи успешно синхронизированы с Twitch.')
  }

  // Запрос сервера на плановое переподключение сессии
  if (command === TwitchIrcCommand.RECONNECT) {
    return buildSystemPayload('Получен системный запрос RECONNECT от сервера Twitch. Запускается процесс планового переподключения.')
  }

  return null
}
