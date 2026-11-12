import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  SOCKET_CONNECTION_STATUSES,
  type ConnectionStatus,
  type ChatAccessStatus,
  TWITCH_CHAT_ACCESS_STATUSES,
  TWITCH_CONNECT_OUTCOMES,
  type SocketStorage,
} from '../types'
import { SocketInstance } from './SocketInstance'
import { TwitchIrcClient } from '../../twitch/twitchIrcClient'
import { useSocketNetworkSync } from '../hooks/useSocketNetworkSync'
import { useSocketWatchdog } from '../hooks/useSocketWatchdog'
import type { MessageCallback } from '../../twitch/utils/createMessageEmitter'

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * Провайдер сокетов для управления WebSocket соединением.
 */
export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [client] = useState<TwitchIrcClient>(() => new TwitchIrcClient())
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(SOCKET_CONNECTION_STATUSES.DISCONNECTED)
  const [chatAccessStatus, setChatAccessStatus] = useState<ChatAccessStatus>(TWITCH_CHAT_ACCESS_STATUSES.OFFLINE)

  const lastActiveChatStatusRef = useRef<ChatAccessStatus>(TWITCH_CHAT_ACCESS_STATUSES.OFFLINE)

  useEffect(() => {
    if (chatAccessStatus !== TWITCH_CHAT_ACCESS_STATUSES.OFFLINE) {
      lastActiveChatStatusRef.current = chatAccessStatus
    }
  }, [chatAccessStatus])

  /** Используется для подписки на изменения статуса сокета. */
  useEffect(() => {
    const unsubscribe = client.onStatusChange((status: ConnectionStatus) => {
      setConnectionStatus(status)

      const isConnectionLost = status === SOCKET_CONNECTION_STATUSES.DISCONNECTED
        || status === SOCKET_CONNECTION_STATUSES.FAILED

      if (!isConnectionLost) return

      lastActiveChatStatusRef.current = TWITCH_CHAT_ACCESS_STATUSES.OFFLINE
      setChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.OFFLINE)
    })

    return () => {
      unsubscribe()
    }
  }, [client])

  /** Инициализируем синхронизацию сети. */
  useSocketNetworkSync({ client, setChatAccessStatus })

  /** Следим за рассинхронизацией статуса соединения. */
  useSocketWatchdog({ client, connectionStatus, lastActiveChatStatusRef, setChatAccessStatus })

  const connect = useCallback((channel: string, token: string, userLogin: string): void => {
    const outcome = client.connect(channel, token, userLogin)

    if (outcome === TWITCH_CONNECT_OUTCOMES.IGNORED) return

    if (outcome === TWITCH_CONNECT_OUTCOMES.ALREADY_CONNECTED) {
      setConnectionStatus(client.status)
      setChatAccessStatus(lastActiveChatStatusRef.current)
      return
    }

    lastActiveChatStatusRef.current = TWITCH_CHAT_ACCESS_STATUSES.OFFLINE
    setChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.OFFLINE)
  }, [client])

  const disconnect = useCallback(() => {
    client.disconnect()
  }, [client])

  const subscribe = useCallback((callback: MessageCallback): (() => void) => {
    return client.subscribe(callback)
  }, [client])

  const sendMessage = useCallback((text: string): boolean => {
    return client.sendMessage(text)
  }, [client])

  const getClient = useCallback((): TwitchIrcClient => {
    return client
  }, [client])

  const updateChatAccessStatus = useCallback((status: ChatAccessStatus): void => {
    setChatAccessStatus(status)
  }, [])

  const onAuthFailure = useCallback((callback: () => void): (() => void) => {
    return client.onAuthFailure(callback)
  }, [client])

  const reconnect = useCallback((): void => {
    client.reconnect()
  }, [client])

  const value: SocketStorage = useMemo(() => ({
    connect,
    disconnect,
    subscribe,
    sendMessage,
    getClient,
    connectionStatus,
    chatAccessStatus,
    updateChatAccessStatus,
    onAuthFailure,
    reconnect,
  }), [connect, disconnect, subscribe, sendMessage, getClient, connectionStatus, chatAccessStatus, updateChatAccessStatus, onAuthFailure, reconnect])

  return (
    <SocketInstance.Provider value={value}>
      {children}
    </SocketInstance.Provider>
  )
}
