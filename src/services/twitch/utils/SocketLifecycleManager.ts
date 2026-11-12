import { SOCKET_CONNECTION_STATUSES, SOCKET_LOG_PREFIX } from '../../../constants/socket.constants.ts'
import { TWITCH_IRC_SOCKET_URL } from '../../../constants/twitch.constants.ts'
import type { ConnectionStatus } from '../../socket/types.ts'

interface SocketListeners {
  onOpen: () => void;
  onMessage: (event: MessageEvent) => void;
  onClose: () => void;
  onError: (error: Event) => void;
}

/**
 * Менеджер жизненного цикла нативного WebSocket.
 * Единственная точка отправки данных в сокет.
 */
export class SocketLifecycleManager {
  private socket: WebSocket | null = null

  public get readyState(): WebSocket['readyState'] | null {
    return this.socket ? this.socket.readyState : null
  }

  /**
   * Возвращает статус соединения по фактическому состоянию сокета.
   */
  public get connectionStatus(): ConnectionStatus {
    if (this.isOpen()) return SOCKET_CONNECTION_STATUSES.CONNECTED
    if (this.isConnecting()) return SOCKET_CONNECTION_STATUSES.CONNECTING

    return SOCKET_CONNECTION_STATUSES.DISCONNECTED
  }

  /**
   * Проверяет, находится ли сокет в процессе подключения.
   */
  public isConnecting(): boolean {
    return this.socket?.readyState === WebSocket.CONNECTING
  }

  /**
   * Проверяет, открыт ли сокет.
   */
  public isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  /**
   * Проверяет, находится ли сокет в процессе подключения или уже открыт.
   */
  public isConnectingOrOpen(): boolean {
    return this.isConnecting() || this.isOpen()
  }

  /**
   * Создает новый сокет и навешивает на него обработчики.
   */
  public create(listeners: SocketListeners): void {
    this.destroy()

    this.socket = new WebSocket(TWITCH_IRC_SOCKET_URL)

    this.socket.onopen = listeners.onOpen
    this.socket.onmessage = listeners.onMessage
    this.socket.onclose = listeners.onClose
    this.socket.onerror = listeners.onError
  }

  /**
   * Отправляет данные через сокет.
   *
   * @returns `true`, если данные переданы сокету.
   */
  public send(text: string): boolean {
    const socket = this.socket

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error(`${SOCKET_LOG_PREFIX} Отправка пропущена: сокет не открыт`)
      return false
    }

    try {
      socket.send(text)
      return true
    } catch (error) {
      console.error(`${SOCKET_LOG_PREFIX} Ошибка отправки данных:`, error)
      return false
    }
  }

  /**
   * Снимает обработчики, закрывает сокет и очищает ссылку на него.
   */
  public destroy(): void {
    if (!this.socket) return

    this.socket.onopen = null
    this.socket.onmessage = null
    this.socket.onclose = null
    this.socket.onerror = null

    try {
      this.socket.close()
    } catch (error) {
      console.error(`${SOCKET_LOG_PREFIX} Ошибка при закрытии сокета:`, error)
    } finally {
      this.socket = null
    }
  }
}
