/**
 * Приводит никнейм к виду для сравнения. Нестроковые значения считаются пустыми.
 *
 * @param username - Никнейм игрока.
 * @returns Никнейм без внешних пробелов и в нижнем регистре.
 */
export const normalizeQueueUsername = (username: unknown): string =>
  typeof username === 'string' ? username.trim().toLowerCase() : ''
