import type { QueueGameConfig, QueueGameKey, QueueSettings } from '../types.ts'
import { QUEUE_GAME_NICKNAME_PATTERNS } from '../../../constants/queue.constants.ts'
import { getOwnValue, isPlainObject } from '../../../utils/objects.ts'

/** Ключи игр, для которых разрешена проверка никнейма. */
const SUPPORTED_GAME_KEYS = Object.keys(QUEUE_GAME_NICKNAME_PATTERNS)

/**
 * Возвращает ключ игры, если значение содержит ключ известной игры.
 *
 * @param value - Значение из хранилища.
 * @returns Ключ игры или `undefined`, если игра неизвестна.
 */
const getSupportedGameKey = (value: unknown): QueueGameKey | undefined => {
  if (!isPlainObject(value)) return undefined

  const key = getOwnValue(value, 'key')
  if (typeof key !== 'string' || !SUPPORTED_GAME_KEYS.includes(key)) return undefined

  return key as QueueGameKey
}

/**
 * Проверяет, что значение — конфигурация известной игры в каноничном виде.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение содержит только ключ известной игры.
 */
const isCanonicalGameConfig = (value: unknown): value is QueueGameConfig =>
  isPlainObject(value) && Object.keys(value).length === 1 && getSupportedGameKey(value) !== undefined

/**
 * Приводит конфигурацию игры к безопасному виду: оставляет только ключ известной игры.
 *
 * @param value - Значение из хранилища.
 * @returns Конфигурация игры или `undefined`, если игра неизвестна.
 */
const sanitizeQueueGameConfig = (value: unknown): QueueGameConfig | undefined => {
  if (isCanonicalGameConfig(value)) return value

  const key = getSupportedGameKey(value)
  return key ? { key } : undefined
}

/**
 * Убирает из настроек повреждённую конфигурацию игры.
 *
 * Правило проверки никнейма берётся из списка игр по ключу, поэтому в настройках
 * хранится только ключ: подменённое правило не попадает в проверку никнеймов.
 *
 * @param settings - Настройки очереди.
 * @returns Настройки с безопасной конфигурацией игры.
 */
export const sanitizeQueueSettings = (settings: QueueSettings): QueueSettings => {
  const currentGame = sanitizeQueueGameConfig(settings.currentGame)
  if (currentGame === settings.currentGame) return settings

  return { ...settings, currentGame }
}
