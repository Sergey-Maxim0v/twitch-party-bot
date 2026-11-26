import type { QueueGameConfig, QueueGameKey, QueueSettings } from '../types.ts'
import { DEFAULT_QUEUE_SETTINGS, QUEUE_GAME_NICKNAME_PATTERNS } from '../../../constants/queue.constants.ts'
import { getCommandNameConflict } from './getCommandNameConflict.ts'
import { normalizeMark } from './normalizeMark.ts'
import { getOwnValue, isPlainObject } from '../../../utils/objects.ts'

/** Ключи игр, для которых разрешена проверка никнейма. */
const SUPPORTED_GAME_KEYS = Object.keys(QUEUE_GAME_NICKNAME_PATTERNS)

const COMMAND_KEYS = Object.keys(DEFAULT_QUEUE_SETTINGS.commands) as Array<keyof QueueSettings['commands']>

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
 * Возвращает настройки команд без повторяющихся триггеров.
 * Конфликтующим командам возвращаются имена по умолчанию.
 *
 * @param commands - Настройки команд из хранилища.
 * @returns Настройки с уникальными триггерами команд.
 */
const sanitizeQueueCommands = (commands: QueueSettings['commands']): QueueSettings['commands'] => {
  let sanitizedCommands = commands

  for (let pass = 0; pass < COMMAND_KEYS.length; pass += 1) {
    const conflictingKeys = COMMAND_KEYS.filter(key => (
      getCommandNameConflict(sanitizedCommands[key].name, sanitizedCommands, key) !== null
    ))

    if (!conflictingKeys.length) break

    const nextCommands = { ...sanitizedCommands }
    conflictingKeys.forEach(key => {
      nextCommands[key] = DEFAULT_QUEUE_SETTINGS.commands[key]
    })
    sanitizedCommands = nextCommands
  }

  return sanitizedCommands
}

/**
 * Ограничивает длину маркеров статусов, чтобы повреждённые настройки не попадали в сообщения.
 */
const sanitizeMarks = (marks: QueueSettings['marks']): QueueSettings['marks'] => {
  const active = normalizeMark(marks.active)
  const removed = normalizeMark(marks.removed)
  const waiting = normalizeMark(marks.waiting)
  if (active === marks.active && removed === marks.removed && waiting === marks.waiting) return marks

  return { active, removed, waiting }
}

/**
 * Убирает из настроек повреждённую конфигурацию игры, дубли команд и длинные маркеры.
 * В настройках хранится только ключ игры: подменённое правило не попадает в проверку никнеймов.
 *
 * @param settings - Настройки очереди.
 * @returns Безопасные настройки.
 */
export const sanitizeQueueSettings = (settings: QueueSettings): QueueSettings => {
  const currentGame = sanitizeQueueGameConfig(settings.currentGame)
  const commands = sanitizeQueueCommands(settings.commands)
  const marks = sanitizeMarks(settings.marks)
  if (currentGame === settings.currentGame && commands === settings.commands && marks === settings.marks) return settings

  return { ...settings, commands, currentGame, marks }
}
