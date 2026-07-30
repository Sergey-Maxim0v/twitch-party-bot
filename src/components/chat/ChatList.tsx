import {useTwitchChat} from "../../services/twitch/hooks/useTwitchChat.ts";
import {ChatMessage} from "./ChatMessage.tsx";

interface ChatListProps {
    useColoredNames: boolean;
}

const ChatList = ({useColoredNames}: ChatListProps) => {
    const {messages} = useTwitchChat();

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
                    />
                ))
            )}
        </div>
    );
};

export default ChatList;
