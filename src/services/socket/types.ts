import type { TwitchIrcClient } from '../twitch/twitchIrcClient.ts'
import type { MessageCallback } from '../twitch/utils/createMessageEmitter.ts'

import {
  RECONNECT_OUTCOMES,
  SOCKET_CONNECTION_STATUSES,
  SOCKET_FAILURE_LOG_MESSAGES,
  SOCKET_FAILURE_REASONS,
  SOCKET_RECONNECT_MAX_ATTEMPTS,
  SOCKET_STABLE_CONNECTION_MS,
  TWITCH_CHAT_ACCESS_STATUSES,
  TWITCH_CONNECT_OUTCOMES,
} from '../../constants/socket.constants.ts'

export {
  RECONNECT_OUTCOMES,
  SOCKET_CONNECTION_STATUSES,
  SOCKET_FAILURE_LOG_MESSAGES,
  SOCKET_FAILURE_REASONS,
  SOCKET_RECONNECT_MAX_ATTEMPTS,
  SOCKET_STABLE_CONNECTION_MS,
  TWITCH_CHAT_ACCESS_STATUSES,
  TWITCH_CONNECT_OUTCOMES,
}

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
  onAuthFailure: (callback: () => void) => (() => void);
  reconnect: () => void;
}

export type ConnectionStatus = typeof SOCKET_CONNECTION_STATUSES[keyof typeof SOCKET_CONNECTION_STATUSES]
export type ChatAccessStatus = typeof TWITCH_CHAT_ACCESS_STATUSES[keyof typeof TWITCH_CHAT_ACCESS_STATUSES]
export type SocketFailureReason = typeof SOCKET_FAILURE_REASONS[keyof typeof SOCKET_FAILURE_REASONS]
export type TwitchConnectOutcome = typeof TWITCH_CONNECT_OUTCOMES[keyof typeof TWITCH_CONNECT_OUTCOMES]
