/** Безопасный лимит длины текстового сообщения для Twitch PRIVMSG. */
const TWITCH_MAX_LENGTH = 400

interface FormatQueueStatusOptions {
  /** Массив никнеймов в активной очереди */
  activeUsernames: string[]
  /** Массив никнеймов в списке ожидания */
  waitingUsernames: string[]
  /** Максимальный размер активной очереди для вывода в префикс */
  maxQueueSize: number
}

/**
 * Форматирует текущий состав активной и ожидающей очереди в компактную строку
 * с учетом лимитов Twitch и приоритетом сохранения участников активной очереди.
 */
export const formatCurrentQueueStatus = ({
  activeUsernames,
  waitingUsernames,
  maxQueueSize,
}: FormatQueueStatusOptions): string => {
  // Добавляем префикс @ к каждому никнейму один раз на старте
  const activeArray = activeUsernames.map(nick => `@${nick}`)
  const waitingArray = waitingUsernames.map(nick => `@${nick}`)

  let showActiveCount = activeArray.length
  let showWaitingCount = waitingArray.length

  const buildString = (): string => {
    const parts: string[] = []

    if (showActiveCount > 0) {
      const items = activeArray.slice(0, showActiveCount).join(', ')
      const hidden = activeArray.length - showActiveCount
      parts.push(`В очереди: ${items}${hidden > 0 ? ` +${hidden}` : ''}`)
    } else if (activeArray.length > 0) {
      parts.push(`В очереди: +${activeArray.length}`)
    }

    if (showWaitingCount > 0) {
      const items = waitingArray.slice(0, showWaitingCount).join(', ')
      const hidden = waitingArray.length - showWaitingCount
      parts.push(`В ожидании: ${items}${hidden > 0 ? ` +${hidden}` : ''}`)
    } else if (waitingArray.length > 0 && showActiveCount === activeArray.length) {
      parts.push(`В ожидании: +${waitingArray.length}`)
    }

    const counter = `(${activeArray.length}/${maxQueueSize})`
    return parts.length > 0 ? `${counter} ${parts.join(' | ')}` : `${counter} Пуста.`
  }

  let result = buildString()

  while (result.length > TWITCH_MAX_LENGTH) {
    if (showWaitingCount > 0) {
      showWaitingCount--
    } else if (showActiveCount > 1) {
      showActiveCount--
    } else {
      break
    }

    result = buildString()
  }

  return result
}
