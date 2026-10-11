import type { TwitchNotificationState } from '../types.ts'

/** Безопасный лимит длины текстового сообщения для Twitch PRIVMSG. */
const TWITCH_MAX_LENGTH = 400

/**
 * Форматирует пакет накопившихся изменений очереди в одну компактную строку
 * с учетом лимитов Twitch и приоритетов отображения групп.
 */
export const formatNotificationMessage = (state: TwitchNotificationState): string => {
  const { joined, deleted, moved, denied } = state

  // Если вообще никаких событий не произошло, возвращаем пустую строку (сигнал для отмены отправки)
  if (joined.size === 0 && deleted.size === 0 && moved.size === 0 && denied.size === 0) {
    return ''
  }

  // Преобразуем Set в массивы строк с префиксом @ для чата Twitch
  const joinedArray = Array.from(joined).map(nick => `@${nick}`)
  const deletedArray = Array.from(deleted).map(nick => `@${nick}`)
  const movedArray = Array.from(moved).map(nick => `@${nick}`)
  const deniedArray = Array.from(denied).map(nick => `@${nick}`)

  // Внутренние счетчики отображаемых элементов в каждой группе
  let showJoinedCount = joinedArray.length
  let showDeletedCount = deletedArray.length
  let showMovedCount = movedArray.length
  let showDeniedCount = deniedArray.length

  /** Вспомогательная функция сборки строки на основе текущих счетчиков лимитов */
  const buildString = (): string => {
    const parts: string[] = []

    if (showJoinedCount > 0) {
      const items = joinedArray.slice(0, showJoinedCount).join(', ')
      const hidden = joinedArray.length - showJoinedCount
      parts.push(`Добавлены: ${items}${hidden > 0 ? ` +${hidden}` : ''}`)
    }

    if (showDeletedCount > 0) {
      const items = deletedArray.slice(0, showDeletedCount).join(', ')
      const hidden = deletedArray.length - showDeletedCount
      parts.push(`Удалены: ${items}${hidden > 0 ? ` +${hidden}` : ''}`)
    }

    if (showMovedCount > 0) {
      const items = movedArray.slice(0, showMovedCount).join(', ')
      const hidden = movedArray.length - showMovedCount
      parts.push(`Перемещены: ${items}${hidden > 0 ? ` +${hidden}` : ''}`)
    }

    if (showDeniedCount > 0) {
      const items = deniedArray.slice(0, showDeniedCount).join(', ')
      const hidden = deniedArray.length - showDeniedCount
      parts.push(`Отказано: ${items}${hidden > 0 ? ` +${hidden}` : ''}`)
    }

    return parts.length > 0 ? `[Очередь] ${parts.join(' | ')}` : ''
  }

  let result = buildString()

  // Если строка превышает лимит, плавно убираем по одному никнейму с учетом приоритетов
  while (result.length > TWITCH_MAX_LENGTH) {
    // Проверяем возможность уменьшения снизу вверх
    if (showDeniedCount > 0) {
      showDeniedCount--
    } else if (showMovedCount > 0) {
      showMovedCount--
    } else if (showDeletedCount > 0) {
      showDeletedCount--
    } else if (showJoinedCount > 1) {
      // Оставляем как минимум 1 участника в высшем приоритете, если это возможно
      showJoinedCount--
    } else {
      // Если урезать больше физически нечего
      break
    }

    result = buildString()
  }

  return result
}
