import { type FC } from 'react'
import ChatInput from './ChatInput.tsx'
import ChatList from './ChatList.tsx'
import ChatSettings from './ChatSettings.tsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { useTwitchChat } from '../hooks/useTwitchChat.ts'

const TwitchChat: FC = () => {
  const [useColoredNames, setUseColoredNames] = useLocalStorage<boolean>('twitch_chat_colored_names', true)
  const [highlightRoles, setHighlightRoles] = useLocalStorage<boolean>('twitch_chat_highlight_roles', true)
  const [IsShowDeletedMessages, setIsShowDeletedMessages] = useLocalStorage<boolean>('twitch_chat_show_moderation_logs', true)
  const [showSystemNotifications, setShowSystemNotifications] = useLocalStorage<boolean>('twitch_chat_show_system_notifications', true)
  const [highlightPointsMessages, setHighlightPointsMessages] = useLocalStorage<boolean>('twitch_chat_highlight_messages', true)

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

export default TwitchChat
