import {useTwitchChat} from "../../services/twitch/hooks/useTwitchChat.ts";

interface ChatListProps {
    useColoredNames: boolean;
}

const ChatList = ({useColoredNames}: ChatListProps) => {
    const {messages} = useTwitchChat();

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col justify-end">
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-base-content/40 italic">
                        Ожидание сообщений из чата...
                    </span>
                </div>
            ) : (
                messages.map((msg) => {
                    const twitchColor = msg.tags.color;
                    const nameStyle = useColoredNames && twitchColor ? {color: twitchColor} : undefined;
                    const nameClassName = !nameStyle ? "font-bold text-primary mr-2" : "font-bold mr-2";

                    return (
                        <div key={msg.id} className="text-sm wrap-break-word leading-relaxed animate-fadeIn">
                            <span className="text-xs text-base-content/40 mr-2 select-none">
                                {msg.timestamp}
                            </span>
                            <span
                                className={nameClassName}
                                style={nameStyle}
                            >
                                {msg.user}:
                            </span>
                            <span className="text-base-content">
                                {msg.text}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ChatList;
