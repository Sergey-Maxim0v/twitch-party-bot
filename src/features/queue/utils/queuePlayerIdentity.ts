import type { QueuePlayer } from '../types'

/**
 * Приводит никнейм к виду для сравнения. Нестроковые значения считаются пустыми.
 *
 * @param username - Никнейм игрока.
 * @returns Никнейм без внешних пробелов и в нижнем регистре.
 */
export const normalizeQueueUsername = (username: unknown): string =>
  typeof username === 'string' ? username.trim().toLowerCase() : ''

/**
 * Проверяет, есть ли в списке запись игрока с указанным никнеймом.
 *
 * Сравнение идёт по никнейму, а не по `userId`: у записей, добавленных
 * через интерфейс приложения, `userId` уникален для каждой записи.
 *
 * @param queue - Список игроков.
 * @param username - Никнейм для поиска.
 * @returns `true`, если игрок уже есть в списке.
 */
export const hasQueuePlayerWithUsername = (
  queue: QueuePlayer[],
  username: string,
): boolean => {
  const normalizedUsername = normalizeQueueUsername(username)
  return queue.some(player => normalizeQueueUsername(player.username) === normalizedUsername)
}
