import { sendInitialIrcCommands } from './utils/sendInitialIrcCommands.ts'
import { handleIrcMessage } from './utils/handleIrcMessage.ts'
import { createMessageEmitter, type MessageCallback, type MessageEmitter } from './utils/createMessageEmitter.ts'
import { isTwitchAuthFailureNotice } from './utils/isTwitchAuthFailureNotice.ts'
import {
  RECONNECT_OUTCOMES,
  SOCKET_CONNECTION_STATUSES,
  SOCKET_FAILURE_REASONS,
  SOCKET_RECONNECT_MAX_ATTEMPTS,
  SOCKET_STABLE_CONNECTION_MS,
  TWITCH_CONNECT_OUTCOMES,
  type ConnectionStatus,
  type SocketFailureReason,
  type TwitchConnectOutcome,
} from '../socket/types.ts'
import { ConnectionStateManager } from './utils/ConnectionStateManager.ts'
import { TwitchReconnectManager } from './utils/TwitchReconnectManager.ts'
import { SocketLifecycleManager } from './utils/SocketLifecycleManager.ts'
import type { ParsedIrcMessage } from './types.ts'
import {
  TWITCH_IRC_CLIENT_LOG_MESSAGES,
  TWITCH_IRC_CLIENT_LOG_PREFIX,
  TWITCH_IRC_COMMANDS,
  TWITCH_SOCKET_CONNECT_DELAY_MS,
} from '../../constants/twitch.constants.ts'

interface TwitchSession {
  channel: string;
  token: string;
  userLogin: string;
}

/**
 * Класс управления WebSocket-соединением с Twitch IRC.
 */
export class TwitchIrcClient {
  private session: TwitchSession | null = null
  private emitter: MessageEmitter = createMessageEmitter()
  private onChannelChangeCallback: (() => void) | null = null
  private isNetworkOffline = false
  private failure: SocketFailureReason | null = null
  private connectedAt: number | null = null
  private readonly authFailureCallbacks = new Set<() => void>()

  private stateManager = new ConnectionStateManager()
  private socketManager = new SocketLifecycleManager()
  private readonly sendToSocket = (text: string): boolean => this.socketManager.send(text)
  private reconnectManager = new TwitchReconnectManager({
    maxAttempts: SOCKET_RECONNECT_MAX_ATTEMPTS,
    onReconnectTriggered: () => { this.runReconnectAttempt() },
  })

  // Задержка гасит двойную инициализацию сокета в React Strict Mode
  private connectTimeoutId: ReturnType<typeof setTimeout> | null = null

  /**
   * Регистрирует колбэк, вызываемый при смене канала.
   */
  public onChannelChange(callback: () => void): void {
    this.onChannelChangeCallback = callback
  }

  /**
   * Подписывается на поток разобранных входящих IRC-сообщений.
   * @returns Функция отписки.
   */
  public subscribe(callback: MessageCallback): () => void {
    return this.emitter.subscribe(callback)
  }

  /**
   * Подписывается на изменение статуса соединения.
   * @returns Функция отписки.
   */
  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    return this.stateManager.subscribe(callback)
  }

  /**
   * Подписывается на отказ Twitch в авторизации.
   * @returns Функция отписки.
   */
  public onAuthFailure(callback: () => void): () => void {
    this.authFailureCallbacks.add(callback)

    return () => {
      this.authFailureCallbacks.delete(callback)
    }
  }

  public get currentChannel(): string | null {
    return this.session?.channel ?? null
  }

  /**
   * Возвращает фактический статус соединения по состоянию сокета.
   */
  public get status(): ConnectionStatus {
    return this.socketManager.connectionStatus
  }

  /**
   * Возвращает системное состояние готовности нативного сокета (readyState).
   */
  public get readyState(): WebSocket['readyState'] | null {
    return this.socketManager.readyState
  }

  /**
   * Возвращает причину терминального отказа соединения.
   */
  public get failureReason(): SocketFailureReason | null {
    return this.failure
  }

  /**
   * Возвращает текущее количество попыток переподключения.
   */
  public get reconnectAttempts(): number {
    return this.reconnectManager.currentAttempts
  }

  /**
   * Возвращает флаг намеренного отключения пользователем.
   */
  public get isIntentionallyDisconnected(): boolean {
    return this.reconnectManager.isIntentionally
  }

  /**
   * Синхронизирует статус соединения с фактическим состоянием сокета.
   */
  public syncStatus(): void {
    this.stateManager.emit(this.status)
  }

  /**
   * Подключается к IRC-каналу Twitch, пересоздавая сокет при необходимости.
   *
   * @returns Результат попытки подключения.
   */
  public connect(channel: string, token: string, userLogin: string): TwitchConnectOutcome {
    if (!channel || !token || !userLogin) return TWITCH_CONNECT_OUTCOMES.IGNORED

    const targetChannel = channel.toLowerCase()
    const currentSession = this.session

    const isSameSession = currentSession !== null
      && currentSession.channel === targetChannel
      && currentSession.token === token
      && currentSession.userLogin === userLogin

    if (isSameSession && this.socketManager.isConnectingOrOpen()) {
      this.syncStatus()
      return TWITCH_CONNECT_OUTCOMES.ALREADY_CONNECTED
    }

    this.session = { channel: targetChannel, token, userLogin }
    this.reconnectManager.resume()
    this.reconnectManager.setIntentionallyDisconnected(false)
    this.failure = null
    this.onChannelChangeCallback?.()

    this.openSocket()

    return TWITCH_CONNECT_OUTCOMES.RECONNECTED
  }

  /**
   * Перезапускает подключение вручную после терминального отказа.
   */
  public reconnect(): void {
    if (!this.session) return
    if (this.failure === SOCKET_FAILURE_REASONS.AUTH) return

    this.reconnectManager.resume()
    this.failure = null
    this.openSocket()
  }

  /**
   * Намеренно закрывает соединение, останавливает переподключения
   * и сбрасывает параметры сессии.
   */
  public disconnect(): void {
    const isAuthFailure = this.failure === SOCKET_FAILURE_REASONS.AUTH

    this.clearConnectTimeout()
    this.reconnectManager.setIntentionallyDisconnected(true)
    this.reconnectManager.resume()
    this.socketManager.destroy()
    this.session = null
    this.isNetworkOffline = false
    this.failure = null

    if (isAuthFailure) return

    this.stateManager.emit(SOCKET_CONNECTION_STATUSES.DISCONNECTED)
  }

  /**
   * Фиксирует потерю сетевого соединения: сокет закрывается,
   * а переподключение откладывается до восстановления сети.
   */
  public handleNetworkOffline(): void {
    if (this.reconnectManager.isIntentionally) return

    this.isNetworkOffline = true
    this.clearConnectTimeout()
    this.reconnectManager.clearTimer()
    this.socketManager.destroy()
    this.stateManager.emit(SOCKET_CONNECTION_STATUSES.DISCONNECTED)
  }

  /**
   * Фиксирует восстановление сетевого соединения и переподключает сокет.
   */
  public handleNetworkOnline(): void {
    if (!this.isNetworkOffline) return

    this.isNetworkOffline = false
    this.forceCloseAndReconnect()
  }

  /**
   * Переподключается после сетевого сбоя, начиная новый цикл попыток.
   * После ручного выхода или отказа в авторизации игнорируется.
   */
  public forceCloseAndReconnect(): void {
    if (this.reconnectManager.isIntentionally || !this.session) return
    if (this.failure === SOCKET_FAILURE_REASONS.AUTH) return

    const isSocketAlive = this.socketManager.isConnectingOrOpen()

    this.clearConnectTimeout()
    this.socketManager.destroy()

    if (isSocketAlive) {
      this.stateManager.emit(SOCKET_CONNECTION_STATUSES.DISCONNECTED)
    }

    this.reconnectManager.resume()
    this.reconnectManager.trigger(true)
  }

  /**
   * Отправляет текстовое сообщение в текущий канал.
   *
   * @returns `true`, если сообщение передано в сокет.
   */
  public sendMessage(text: string): boolean {
    const channel = this.session?.channel

    if (!channel) {
      console.error(`${TWITCH_IRC_CLIENT_LOG_PREFIX} ${TWITCH_IRC_CLIENT_LOG_MESSAGES.CHANNEL_NOT_SET}`)
      return false
    }

    return this.socketManager.send(`PRIVMSG #${channel} :${text}`)
  }

  /**
   * Отправляет низкоуровневую системную строку в сокет.
   */
  public sendRaw(text: string): void {
    this.socketManager.send(text)
  }

  /**
   * Создаёт сокет для текущей сессии.
   */
  private openSocket(): void {
    const session = this.session

    if (!session) return

    this.clearConnectTimeout()
    this.socketManager.destroy()
    this.stateManager.emit(SOCKET_CONNECTION_STATUSES.CONNECTING)

    this.connectTimeoutId = setTimeout(() => {
      this.socketManager.create({
        onOpen: () => { this.handleSocketOpen() },
        onMessage: event => { this.handleSocketMessage(event) },
        onClose: () => { this.handleSocketClose() },
        onError: error => { console.error(`${TWITCH_IRC_CLIENT_LOG_PREFIX} ${TWITCH_IRC_CLIENT_LOG_MESSAGES.SOCKET_ERROR}:`, error) },
      })
      this.connectTimeoutId = null
    }, TWITCH_SOCKET_CONNECT_DELAY_MS)
  }

  private handleSocketOpen(): void {
    const session = this.session

    if (!session) return

    this.connectedAt = Date.now()
    this.stateManager.emit(SOCKET_CONNECTION_STATUSES.CONNECTED)

    if (!this.socketManager.isOpen()) return

    sendInitialIrcCommands({
      send: this.sendToSocket,
      token: session.token,
      userLogin: session.userLogin,
      channel: session.channel,
    })
  }

  private handleSocketMessage(event: MessageEvent): void {
    handleIrcMessage({
      event,
      send: this.sendToSocket,
      emitMessage: (message: ParsedIrcMessage) => {
        this.emitter.emit(message)

        if (message.command === TWITCH_IRC_COMMANDS.GLOBAL_USER_STATE) {
          this.reconnectManager.resetAttempts()
          return
        }

        if (message.command === TWITCH_IRC_COMMANDS.RECONNECT) {
          this.forceCloseAndReconnect()
          return
        }

        if (isTwitchAuthFailureNotice(message)) {
          this.handleAuthFailure()
        }
      },
    })
  }

  private handleSocketClose(): void {
    this.resetAttemptsOnStableConnection()

    const outcome = this.reconnectManager.trigger(this.session !== null)

    if (outcome === RECONNECT_OUTCOMES.LIMIT_REACHED) {
      this.handleReconnectLimitReached()
      return
    }

    this.stateManager.emit(SOCKET_CONNECTION_STATUSES.DISCONNECTED)
  }

  /**
   * Останавливает восстановление при отказе Twitch в авторизации.
   */
  private handleAuthFailure(): void {
    this.failure = SOCKET_FAILURE_REASONS.AUTH
    this.reconnectManager.stop()
    this.socketManager.destroy()
    this.stateManager.emit(SOCKET_CONNECTION_STATUSES.FAILED)

    this.authFailureCallbacks.forEach(callback => { callback() })
  }

  /**
   * Фиксирует исчерпание лимита попыток переподключения.
   */
  private handleReconnectLimitReached(): void {
    this.failure = SOCKET_FAILURE_REASONS.LIMIT
    this.stateManager.emit(SOCKET_CONNECTION_STATUSES.FAILED)
  }

  /**
   * Выполняет очередную попытку переподключения.
   */
  private runReconnectAttempt(): void {
    if (this.reconnectManager.isIntentionally || !this.session) return

    this.openSocket()
  }

  /**
   * Сбрасывает счётчик попыток, если соединение прожило достаточно долго:
   * авторизация была подтверждена, значит обрыв разовый.
   */
  private resetAttemptsOnStableConnection(): void {
    const connectedAt = this.connectedAt

    this.connectedAt = null

    if (connectedAt === null) return
    if (Date.now() - connectedAt < SOCKET_STABLE_CONNECTION_MS) return

    this.reconnectManager.resetAttempts()
  }

  private clearConnectTimeout(): void {
    if (!this.connectTimeoutId) return

    clearTimeout(this.connectTimeoutId)
    this.connectTimeoutId = null
  }
}
