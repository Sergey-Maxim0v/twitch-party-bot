import type { TwitchIrcClient } from '../twitch/twitchIrcClient.ts'
import type { MessageCallback } from '../twitch/utils/createMessageEmitter.ts'

import { SOCKET_CONNECTION_STATUSES, TWITCH_CHAT_ACCESS_STATUSES } from '../../constants/socket.constants.ts'

export { SOCKET_CONNECTION_STATUSES, TWITCH_CHAT_ACCESS_STATUSES }

/**
 * Интерфейс для хранения состояния сокета.
 */
export interface SocketStorage {
  connect: (channel: string, token: string, userLogin: string) => void;
  disconnect: () => void;
  subscribe: (callback: MessageCallback) => (() => void);
  sendMessage: (text: string) => boolean;
  getClient: () => TwitchIrcClient;
  connectionStatus: ConnectionStatus;
  chatAccessStatus: ChatAccessStatus;
  updateChatAccessStatus: (status: ChatAccessStatus) => void;
}

export type ConnectionStatus = typeof SOCKET_CONNECTION_STATUSES[keyof typeof SOCKET_CONNECTION_STATUSES]
export type ChatAccessStatus = typeof TWITCH_CHAT_ACCESS_STATUSES[keyof typeof TWITCH_CHAT_ACCESS_STATUSES]
