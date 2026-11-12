import { getReconnectDelay } from './getReconnectDelay.ts'
import {
  RECONNECT_OUTCOMES,
  SOCKET_RECONNECT_LOG_MESSAGES,
  SOCKET_RECONNECT_LOG_PREFIX,
  SOCKET_RECONNECT_MAX_ATTEMPTS,
} from '../../../constants/socket.constants.ts'

interface ReconnectConfig {
  /** Максимальное количество автоматических попыток переподключения. */
  maxAttempts?: number;
  /** Колбэк запуска очередной попытки переподключения. */
  onReconnectTriggered: () => void;
}

/**
 * Результат запуска автоматического переподключения.
 */
export type ReconnectOutcome = typeof RECONNECT_OUTCOMES[keyof typeof RECONNECT_OUTCOMES]

/**
 * Менеджер политики автоматических переподключений для Twitch IRC.
 * Исчерпание лимита попыток останавливает восстановление.
 */
export class TwitchReconnectManager {
  private attempts = 0
  private readonly maxAttempts: number
  private timerId: ReturnType<typeof setTimeout> | null = null
  private isIntentionallyDisconnected = false
  private isStopped = false
  private readonly onReconnectTriggered: () => void

  constructor(config: ReconnectConfig) {
    this.maxAttempts = config.maxAttempts ?? SOCKET_RECONNECT_MAX_ATTEMPTS
    this.onReconnectTriggered = config.onReconnectTriggered
  }

  public get currentAttempts(): number {
    return this.attempts
  }

  public get isIntentionally(): boolean {
    return this.isIntentionallyDisconnected
  }

  /**
   * Достигнут ли лимит попыток переподключения.
   */
  public get isLimitReached(): boolean {
    return this.attempts >= this.maxAttempts
  }

  public setIntentionallyDisconnected(value: boolean): void {
    this.isIntentionallyDisconnected = value
  }

  /**
   * Сбрасывает счётчик попыток, не снимая остановку восстановления.
   */
  public resetAttempts(): void {
    this.attempts = 0
  }

  /**
   * Перезапускает восстановление: сбрасывает счётчик попыток,
   * снимает остановку и отменяет отложенную попытку.
   */
  public resume(): void {
    this.resetAttempts()
    this.isStopped = false
    this.clearTimer()
  }

  /**
   * Останавливает автоматическое переподключение.
   */
  public stop(): void {
    this.isStopped = true
    this.clearTimer()
  }

  /**
   * Очищает активный таймер переподключения.
   */
  public clearTimer(): void {
    if (!this.timerId) return

    clearTimeout(this.timerId)
    this.timerId = null
  }

  /**
   * Планирует очередную попытку переподключения.
   * Исчерпание лимита останавливает восстановление.
   *
   * @param hasSessionParams - Есть ли данные сессии для повторного подключения.
   * @returns Результат запуска переподключения.
   */
  public trigger(hasSessionParams: boolean): ReconnectOutcome {
    if (this.isIntentionallyDisconnected || this.isStopped) {
      return RECONNECT_OUTCOMES.SKIPPED
    }

    if (!hasSessionParams) {
      console.error(`${SOCKET_RECONNECT_LOG_PREFIX} ${SOCKET_RECONNECT_LOG_MESSAGES.SESSION_PARAMS_MISSING}`)
      return RECONNECT_OUTCOMES.SKIPPED
    }

    if (this.isLimitReached) {
      this.stop()
      return RECONNECT_OUTCOMES.LIMIT_REACHED
    }

    this.attempts += 1

    const delay = getReconnectDelay(this.attempts)

    this.clearTimer()
    this.timerId = setTimeout(() => {
      this.onReconnectTriggered()
    }, delay)

    return RECONNECT_OUTCOMES.SCHEDULED
  }
}
