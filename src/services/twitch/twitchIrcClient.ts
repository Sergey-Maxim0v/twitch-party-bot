import { sendInitialIrcCommands } from './utils/sendInitialIrcCommands.ts'
import { handleIrcMessage } from './utils/handleIrcMessage.ts'
import { createMessageEmitter, type MessageCallback, type MessageEmitter } from './utils/createMessageEmitter.ts'
import {
  SOCKET_CONNECTION_STATUSES,
  TWITCH_CONNECT_OUTCOMES,
  type ConnectionStatus,
  type TwitchConnectOutcome,
} from '../socket/types.ts'
import { SOCKET_RECONNECT_MAX_ATTEMPTS } from '../../constants/socket.constants.ts'
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

  private stateManager = new ConnectionStateManager()
  private socketManager = new SocketLifecycleManager()
  private readonly sendToSocket = (text: string): boolean => this.socketManager.send(text)
  private reconnectManager = new TwitchReconnectManager({
    maxAttempts: SOCKET_RECONNECT_MAX_ATTEMPTS,
    onReconnectTriggered: () => { this.retryConnection() },
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
   * Подписывается на поток распарсенных входящих IRC-сообщений.
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

  public get currentChannel(): string | null {
    return this.session?.channel ?? null
  }

  /**
   * Возвращает текущее системное состояние готовности нативного сокета (readyState).
   */
  public get readyState(): WebSocket['readyState'] | null {
    return this.socketManager.readyState
  }

  /**
   * Возвращает фактический статус соединения по состоянию сокета.
   */
  public get status(): ConnectionStatus {
    return this.socketManager.connectionStatus
  }

  /**
   * Синхронизирует статус соединения с фактическим состоянием сокета.
   */
  public syncStatus(): void {
    this.stateManager.emit(this.status)
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

    this.clearConnectTimeout()

    if (currentSession?.channel !== targetChannel) {
      this.reconnectManager.clearTimer()
      this.reconnectManager.resetAttempts()
    }

    this.session = { channel: targetChannel, token, userLogin }
    this.reconnectManager.setIntentionallyDisconnected(false)
    this.onChannelChangeCallback?.()

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

    return TWITCH_CONNECT_OUTCOMES.RECONNECTED
  }

  /**
   * Намеренно закрывает соединение, останавливает переподключения
   * и сбрасывает параметры сессии.
   */
  public disconnect(): void {
    this.clearConnectTimeout()
    this.reconnectManager.setIntentionallyDisconnected(true)
    this.reconnectManager.clearTimer()
    this.reconnectManager.resetAttempts()
    this.socketManager.destroy()
    this.session = null
    this.isNetworkOffline = false
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
   * После ручного выхода игнорируется.
   */
  public forceCloseAndReconnect(): void {
    if (this.reconnectManager.isIntentionally || !this.session) return

    const isSocketAlive = this.socketManager.isConnectingOrOpen()

    this.clearConnectTimeout()
    this.socketManager.destroy()

    if (isSocketAlive) {
      this.stateManager.emit(SOCKET_CONNECTION_STATUSES.DISCONNECTED)
    }

    this.reconnectManager.resetAttempts()
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

  private handleSocketOpen(): void {
    const session = this.session

    if (!session) return

    this.reconnectManager.resetAttempts()
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

        if (message.command === TWITCH_IRC_COMMANDS.RECONNECT) {
          this.forceCloseAndReconnect()
        }
      },
    })
  }

  private handleSocketClose(): void {
    this.stateManager.emit(SOCKET_CONNECTION_STATUSES.DISCONNECTED)
    this.reconnectManager.trigger(this.session !== null)
  }

  private retryConnection(): void {
    const session = this.session

    if (this.reconnectManager.isIntentionally || !session) return

    this.connect(session.channel, session.token, session.userLogin)
  }

  private clearConnectTimeout(): void {
    if (!this.connectTimeoutId) return

    clearTimeout(this.connectTimeoutId)
    this.connectTimeoutId = null
  }
}
