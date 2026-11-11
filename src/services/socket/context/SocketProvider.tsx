import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  TWITCH_CHAT_ACCESS_STATUSES,
  type ChatAccessStatus,
  SOCKET_CONNECTION_STATUSES,
  type ConnectionStatus,
  type SocketStorage,
} from '../types'
import { SocketInstance } from './SocketInstance'
import { TwitchIrcClient } from '../../twitch/twitchIrcClient'
import { useSocketNetworkSync } from '../hooks/useSocketNetworkSync'
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

      if (status === SOCKET_CONNECTION_STATUSES.DISCONNECTED) {
        lastActiveChatStatusRef.current = TWITCH_CHAT_ACCESS_STATUSES.OFFLINE
        setChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.OFFLINE)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [client])

  /** Инициализируем синхронизацию сети. */
  useSocketNetworkSync({ client, lastActiveChatStatusRef, setConnectionStatus, setChatAccessStatus })

  const connect = useCallback((channel: string, token: string, userLogin: string): void => {
    lastActiveChatStatusRef.current = TWITCH_CHAT_ACCESS_STATUSES.OFFLINE
    setConnectionStatus(SOCKET_CONNECTION_STATUSES.CONNECTING)
    setChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.OFFLINE)

    client.connect(channel, token, userLogin)
  }, [client])

  const disconnect = useCallback(() => {
    lastActiveChatStatusRef.current = TWITCH_CHAT_ACCESS_STATUSES.OFFLINE
    setChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.OFFLINE)
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

  const value: SocketStorage = useMemo(() => ({
    connect,
    disconnect,
    subscribe,
    sendMessage,
    getClient,
    connectionStatus,
    chatAccessStatus,
    updateChatAccessStatus,
  }), [connect, disconnect, subscribe, sendMessage, getClient, connectionStatus, chatAccessStatus, updateChatAccessStatus])

  return (
    <SocketInstance.Provider value={value}>
      {children}
    </SocketInstance.Provider>
  )
}
