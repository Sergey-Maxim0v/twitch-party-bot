import {
  AUTH_CONTEXT_TYPE,
  AUTH_STATE_VALIDATION_RESULTS,
  TWITCH_AUTH_STATE_STORAGE_KEY,
  TWITCH_AUTH_STATE_TTL_MS,
} from '../../../constants/auth.constants.ts'
import type { AuthContextType, AuthStateValidationResult } from '../types'
import {
  readWebStorage,
  removeWebStorage,
  writeWebStorage,
  type WebStorageKind,
} from '../../../hooks/utils/webStorage.utils.ts'

const AUTH_STORAGE_KIND: WebStorageKind = 'sessionStorage'

/**
 * Данные попытки входа, сохраняемые в sessionStorage перед редиректом на Twitch.
 */
export interface AuthAttempt {
  state: string;
  contextType: AuthContextType;
  createdAt: number;
}

/**
 * Результат проверки попытки входа.
 */
export interface AuthConsumeResult {
  result: AuthStateValidationResult;
  attempt: AuthAttempt | null;
}

/**
 * Генерирует случайную строку для параметра `state`, защищающего OAuth-поток от CSRF.
 *
 * @returns Случайная hex-строка длиной 32 символа.
 */
export const generateRandomState = (): string => {
  const array = new Uint32Array(4)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('')
}

/**
 * Сохраняет попытку входа (`state` + контекст) перед редиректом на Twitch.
 *
 * @param state - Сгенерированное значение `state`.
 * @param contextType - Контекст входа: `popup` или `tab`.
 * @returns `true`, если состояние удалось сохранить.
 */
export const saveAuthAttempt = (state: string, contextType: AuthContextType): boolean => (
  writeWebStorage(AUTH_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY, JSON.stringify({
    state,
    contextType,
    createdAt: Date.now(),
  } satisfies AuthAttempt))
)

/**
 * Удаляет сохранённую попытку входа.
 */
export const clearAuthAttempt = (): void => {
  removeWebStorage(AUTH_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY)
}

/**
 * Проверяет, что значение похоже на контекст входа.
 *
 * @param value - Значение из хранилища.
 * @returns `true`, если значение является известным контекстом.
 */
const isAuthContextType = (value: unknown): value is AuthContextType => (
  value === AUTH_CONTEXT_TYPE.POPUP || value === AUTH_CONTEXT_TYPE.TAB
)

/**
 * Проверяет, что значение является конечным числом.
 *
 * @param value - Значение из хранилища.
 * @returns `true`, если значение — конечное число.
 */
const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
)

/**
 * Восстанавливает попытку входа из сохранённой записи.
 *
 * @param value - Значение из хранилища.
 * @returns Попытка входа или `null`, если запись повреждена.
 */
const parseAuthAttempt = (value: string | null): AuthAttempt | null => {
  if (!value) return null

  try {
    const { state, contextType, createdAt } = JSON.parse(value) as Partial<AuthAttempt>

    if (typeof state !== 'string' || !isFiniteNumber(createdAt)) return null

    return {
      state,
      contextType: isAuthContextType(contextType) ? contextType : AUTH_CONTEXT_TYPE.TAB,
      createdAt,
    }
  } catch {
    return null
  }
}

/**
 * Проверяет, что попытка входа не старше допустимого срока.
 *
 * @param attempt - Попытка входа из хранилища.
 * @returns `true`, если попытка просрочена.
 */
const isAuthAttemptExpired = (attempt: AuthAttempt): boolean => (
  Date.now() - attempt.createdAt > TWITCH_AUTH_STATE_TTL_MS
)

/**
 * Сверяет вернувшийся `state` с сохранённой попыткой входа и удаляет её.
 *
 * Запись удаляется при любом исходе: висящая попытка входа не должна
 * засчитываться следующему запросу и оставаться в хранилище.
 *
 * @param receivedState - Значение `state` из URL после редиректа.
 * @returns Результат проверки и сохранённая попытка (если была).
 */
export const consumeAuthAttempt = (receivedState: string | null): AuthConsumeResult => {
  const { value, isAvailable } = readWebStorage(AUTH_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY)

  if (!isAvailable) {
    return { result: AUTH_STATE_VALIDATION_RESULTS.UNAVAILABLE, attempt: null }
  }

  removeWebStorage(AUTH_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY)

  const attempt = parseAuthAttempt(value)

  if (!attempt) {
    return { result: AUTH_STATE_VALIDATION_RESULTS.INVALID, attempt: null }
  }

  if (isAuthAttemptExpired(attempt)) {
    return { result: AUTH_STATE_VALIDATION_RESULTS.EXPIRED, attempt }
  }

  const isValid = attempt.state === receivedState

  return {
    result: isValid ? AUTH_STATE_VALIDATION_RESULTS.VALID : AUTH_STATE_VALIDATION_RESULTS.INVALID,
    attempt,
  }
}
