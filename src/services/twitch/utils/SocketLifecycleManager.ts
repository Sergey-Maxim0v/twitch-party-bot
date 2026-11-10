import { TWITCH_IRC_SOCKET_URL } from '../../../constants/twitch.constants.ts'

interface SocketListeners {
  onOpen: () => void;
  onMessage: (event: MessageEvent) => void;
  onClose: () => void;
  onError: (error: Event) => void;
}

/**
 * Менеджер жизненного цикла нативного WebSocket.
 */
export class SocketLifecycleManager {
  private socket: WebSocket | null = null

  public get rawSocket(): WebSocket | null {
    return this.socket
  }

  public get readyState(): WebSocket['readyState'] | null {
    return this.socket ? this.socket.readyState : null
  }

  /**
   * Проверяет, находится ли сокет в процессе подключения или уже открыт.
   */
  public isConnectingOrOpen(): boolean {
    if (!this.socket) return false
    return this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN
  }

  /**
   * Проверяет, открыт ли сокет.
   */
  public isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  /**
   * Создает новый сокет и навешивает на него обработчики.
   * @returns Созданный экземпляр сокета.
   */
  public create(listeners: SocketListeners): WebSocket {
    this.destroy()

    this.socket = new WebSocket(TWITCH_IRC_SOCKET_URL)

    this.socket.onopen = listeners.onOpen
    this.socket.onmessage = listeners.onMessage
    this.socket.onclose = listeners.onClose
    this.socket.onerror = listeners.onError

    return this.socket
  }

  /**
   * Отправляет данные через открытый сокет.
   */
  public send(text: string): void {
    this.socket?.send(text)
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
    } catch (e) {
      console.error('[SocketLifecycleManager] Ошибка при закрытии сокета:', e)
    } finally {
      this.socket = null
    }
  }
}
