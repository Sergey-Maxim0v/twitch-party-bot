import { useEffect, useRef } from 'react'
import type { TwitchIrcClient } from '../twitchIrcClient.ts'

/**
 * Вызывает обработчик при фактической смене канала.
 *
 * Канал сравнивается с предыдущим значением, поэтому повторное подключение
 * к тому же каналу обработчик не вызывает.
 *
 * @param client - Клиент соединения с Twitch IRC.
 * @param onChannelChanged - Действие, выполняемое при смене канала.
 */
export const useTwitchChannelChange = (
  client: TwitchIrcClient | null,
  onChannelChanged: () => void,
): void => {
  const onChannelChangedRef = useRef(onChannelChanged)
  const lastChannelRef = useRef<string | null>(null)

  useEffect(() => {
    onChannelChangedRef.current = onChannelChanged
  }, [onChannelChanged])

  useEffect(() => {
    if (!client) return

    if (client.currentChannel) {
      lastChannelRef.current = client.currentChannel
    }

    return client.onChannelChange(() => {
      const nextChannel = client.currentChannel
      const isChannelChanged = nextChannel !== lastChannelRef.current

      lastChannelRef.current = nextChannel

      if (!isChannelChanged) return

      onChannelChangedRef.current()
    })
  }, [client])
}
