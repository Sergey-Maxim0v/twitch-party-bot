import { type FC } from 'react'
import { ChatInput } from './ChatInput.tsx'
import { ChatList } from './ChatList.tsx'
import { ChatSettings } from './ChatSettings.tsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { TWITCH_CHAT_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { useTwitchChat } from '../hooks/useTwitchChat.ts'

/**
 * Компонент чата Twitch: история сообщений, настройки и поле ввода.
 */
export const TwitchChat: FC = () => {
  const [useColoredNames, setUseColoredNames] = useLocalStorage<boolean>(TWITCH_CHAT_STORAGE_KEYS.COLORED_NAMES, true)
  const [highlightRoles, setHighlightRoles] = useLocalStorage<boolean>(TWITCH_CHAT_STORAGE_KEYS.HIGHLIGHT_ROLES, true)
  const [IsShowDeletedMessages, setIsShowDeletedMessages] = useLocalStorage<boolean>(TWITCH_CHAT_STORAGE_KEYS.SHOW_MODERATION_LOGS, true)
  const [showSystemNotifications, setShowSystemNotifications] = useLocalStorage<boolean>(TWITCH_CHAT_STORAGE_KEYS.SHOW_SYSTEM_NOTIFICATIONS, true)
  const [highlightPointsMessages, setHighlightPointsMessages] = useLocalStorage<boolean>(TWITCH_CHAT_STORAGE_KEYS.HIGHLIGHT_MESSAGES, true)

  const { messages, sendChatMessage } = useTwitchChat()

  return (
    <>
      <ChatList
        highlightPointsMessages={highlightPointsMessages}
        highlightRoles={highlightRoles}
        IsShowDeletedMessages={IsShowDeletedMessages}
        messages={messages}
        showSystemNotifications={showSystemNotifications}
        useColoredNames={useColoredNames}
      />

      <ChatInput
        actions={
          <ChatSettings
            highlightPointsMessages={highlightPointsMessages}
            highlightRoles={highlightRoles}
            IsShowDeletedMessages={IsShowDeletedMessages}
            setHighlightPointsMessages={setHighlightPointsMessages}
            setHighlightRoles={setHighlightRoles}
            setIsShowDeletedMessages={setIsShowDeletedMessages}
            setShowSystemNotifications={setShowSystemNotifications}
            setUseColoredNames={setUseColoredNames}
            showSystemNotifications={showSystemNotifications}
            useColoredNames={useColoredNames}
          />
        }
        onSendMessage={sendChatMessage}
      />
    </>
  )
}
