import {useTwitchChat} from "../../services/twitch/hooks/useTwitchChat.ts";

const ChatList = () => {
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
                messages.map((msg) => (
                    <div key={msg.id} className="text-sm wrap-break-word leading-relaxed animate-fadeIn">
                        {/* Вывод времени сообщения */}
                        <span className="text-xs text-base-content/40 mr-2 select-none">
                            {msg.timestamp}
                        </span>
                        <span className="font-bold text-primary mr-2">
                            {msg.user}:
                        </span>
                        <span className="text-base-content">
                            {msg.text}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
};

export default ChatList;
