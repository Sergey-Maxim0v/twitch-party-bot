import { type FC } from 'react'
import ChatInput from './ChatInput.tsx'
import ChatList from './ChatList.tsx'
import { useTwitchChat } from '../hooks/useTwitchChat.ts'
import ChatSettings from './ChatSettings.tsx'
import CollapsiblePanel from '../../../components/layout/panel/CollapsiblePanel.tsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'

export interface TwitchChatProps {
  className?: string;
  collapsedClassName?: string;
}

const TwitchChat: FC<TwitchChatProps> = ({ className = '', collapsedClassName }) => {
  const [isOpen, setIsOpen] = useLocalStorage<boolean>('twitch_chat_open', true)
  const [useColoredNames, setUseColoredNames] = useLocalStorage<boolean>('twitch_chat_colored_names', true)
  const [highlightRoles, setHighlightRoles] = useLocalStorage<boolean>('twitch_chat_highlight_roles', true)
  const [IsShowDeletedMessages, setIsShowDeletedMessages] = useLocalStorage<boolean>('twitch_chat_show_moderation_logs', true)
  const [showSystemNotifications, setShowSystemNotifications] = useLocalStorage<boolean>('twitch_chat_show_system_notifications', true)
  const [highlightPointsMessages, setHighlightPointsMessages] = useLocalStorage<boolean>('twitch_chat_highlight_messages', true)

  const { messages, registerPendingMessage } = useTwitchChat()

  return (
    <CollapsiblePanel
      className={className}
      collapsedClassName={collapsedClassName}
      isOpen={isOpen}
      onToggle={() => { setIsOpen(!isOpen) }}
      title="Чат трансляции"
    >
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
        onSendMessage={registerPendingMessage}
      />
    </CollapsiblePanel>
  )
}

export default TwitchChat
