import type { QueuePlayer } from '../types'

/**
 * Приводит никнейм игрока к виду для сравнения.
 */
export const normalizeQueueUsername = (username: string): string => username.trim().toLowerCase()

/**
 * Проверяет, есть ли в списке запись игрока с указанным никнеймом.
 *
 * Сравнение идёт по никнейму, а не по `userId`: у записей, добавленных
 * через интерфейс приложения, `userId` уникален для каждой записи.
 */
export const hasQueuePlayerWithUsername = (
  queue: QueuePlayer[],
  username: string,
): boolean => {
  const normalizedUsername = normalizeQueueUsername(username)
  return queue.some(player => normalizeQueueUsername(player.username) === normalizedUsername)
}
