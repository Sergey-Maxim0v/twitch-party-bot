import ChatMessage from './ChatMessage.tsx'
import type { ParsedIrcMessage } from '../utils/parseIrcMessage.ts'

interface ChatListProps {
  messages: ParsedIrcMessage[];
  useColoredNames: boolean;
  highlightRoles: boolean;
  IsShowDeletedMessages: boolean;
  showSystemNotifications: boolean;
  highlightPointsMessages: boolean;
}

const ChatList = ({
  messages,
  useColoredNames,
  IsShowDeletedMessages,
  highlightRoles,
  showSystemNotifications,
  highlightPointsMessages,
}: ChatListProps) => {

  const reversedMessages = [...messages].reverse()

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col-reverse">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-base-content/40 italic">
            Ожидание сообщений из чата...
          </span>
        </div>
      ) : (
        reversedMessages.map(msg => (
          <ChatMessage
            highlightPointsMessages={highlightPointsMessages}
            highlightRoles={highlightRoles}
            isShowDeletedMessages={IsShowDeletedMessages}
            key={msg.id}
            msg={msg}
            showSystemNotifications={showSystemNotifications}
            useColoredNames={useColoredNames}
          />
        ))
      )}
    </div>
  )
}

export default ChatList
