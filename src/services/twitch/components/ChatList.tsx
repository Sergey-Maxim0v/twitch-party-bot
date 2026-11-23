import { ChatMessage } from './ChatMessage.tsx'
import type { ParsedIrcMessage, TwitchEmoteDictionary } from '../types.ts'

interface ChatListProps {
  messages: ParsedIrcMessage[];
  useColoredNames: boolean;
  highlightRoles: boolean;
  IsShowDeletedMessages: boolean;
  showSystemNotifications: boolean;
  highlightPointsMessages: boolean;
  showEmotes: boolean;
  emoteDictionary: TwitchEmoteDictionary;
}

/**
 * Список сообщений чата Twitch с учетом пользовательских настроек отображения.
 */
export const ChatList = ({
  messages,
  useColoredNames,
  IsShowDeletedMessages,
  highlightRoles,
  showSystemNotifications,
  highlightPointsMessages,
  showEmotes,
  emoteDictionary,
}: ChatListProps) => {

  const reversedMessages = [...messages].reverse()

  return (
    <div className="flex-1 overflow-y-auto p-4 gap-1 flex flex-col-reverse">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-base-content/40 italic">
            Ожидание сообщений из чата...
          </span>
        </div>
      ) : (
        reversedMessages.map(msg => (
          <ChatMessage
            emoteDictionary={emoteDictionary}
            highlightPointsMessages={highlightPointsMessages}
            highlightRoles={highlightRoles}
            isShowDeletedMessages={IsShowDeletedMessages}
            key={msg.id}
            msg={msg}
            showEmotes={showEmotes}
            showSystemNotifications={showSystemNotifications}
            useColoredNames={useColoredNames}
          />
        ))
      )}
    </div>
  )
}
