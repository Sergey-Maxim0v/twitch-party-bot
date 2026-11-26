import { QUEUE_MARK_MAX_LENGTH } from '../../../constants/queue.constants.ts'

/**
 * Приводит маркер статуса к строке не длиннее QUEUE_MARK_MAX_LENGTH символов.
 */
export const normalizeMark = (value: unknown): string => (
  typeof value === 'string'
    ? [...value.trim()].slice(0, QUEUE_MARK_MAX_LENGTH).join('')
    : ''
)
