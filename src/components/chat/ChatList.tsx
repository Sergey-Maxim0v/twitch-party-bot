import type {ParsedIrcMessage} from "../../services/twitch";
import ChatMessage from "./ChatMessage";

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
                      highlightPointsMessages
                  }: ChatListProps) => {

    const reversedMessages = [...messages].reverse();

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col-reverse">
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-base-content/40 italic">
                        Ожидание сообщений из чата...
                    </span>
                </div>
            ) : (
                reversedMessages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        msg={msg}
                        useColoredNames={useColoredNames}
                        highlightRoles={highlightRoles}
                        IsShowDeletedMessages={IsShowDeletedMessages}
                        showSystemNotifications={showSystemNotifications}
                        highlightPointsMessages={highlightPointsMessages}
                    />
                ))
            )}
        </div>
    );
};

export default ChatList;
