import { useEffect, useRef } from 'react'
import type { TwitchIrcClient } from '../twitchIrcClient.ts'
import type { ChannelChangeCallback } from '../types.ts'

/**
 * Вызывает обработчик при изменении канала IRC-сессии.
 *
 * Первое подключение и отключение не считаются сменой и не вызывают обработчик.
 *
 * @param client - Клиент соединения с Twitch IRC.
 * @param onChannelChanged - Обработчик изменения канала.
 */
export const useTwitchChannelChange = (
  client: TwitchIrcClient | null,
  onChannelChanged: ChannelChangeCallback,
): void => {
  const onChannelChangedRef = useRef(onChannelChanged)
  const hasConnectedRef = useRef(false)

  useEffect(() => {
    onChannelChangedRef.current = onChannelChanged
  }, [onChannelChanged])

  useEffect(() => {
    if (!client) return

    hasConnectedRef.current = client.currentChannel !== null

    return client.onChannelChange(change => {
      if (!change.current) return

      const isFirstConnection = !hasConnectedRef.current
      hasConnectedRef.current = true

      if (isFirstConnection) return

      onChannelChangedRef.current(change)
    })
  }, [client])
}
