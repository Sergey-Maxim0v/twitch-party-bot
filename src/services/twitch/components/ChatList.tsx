import { ChatMessage } from './ChatMessage.tsx'
import type { ChatDisplayOptions, ParsedIrcMessage, TwitchEmoteDictionary } from '../types.ts'

interface ChatListProps extends ChatDisplayOptions {
  messages: ParsedIrcMessage[];
  emoteDictionary: TwitchEmoteDictionary;
}

/**
 * Список сообщений чата Twitch с учетом пользовательских настроек отображения.
 */
export const ChatList = ({
  messages,
  useColoredNames,
  isShowDeletedMessages,
  highlightRoles,
  showSystemNotifications,
  highlightPointsMessages,
  showEmotes,
  emoteDictionary,
}: ChatListProps) => {
  const reversedMessages = [...messages].reverse()

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin p-4 gap-1 flex flex-col-reverse">
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
            isShowDeletedMessages={isShowDeletedMessages}
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
