import type {FC} from "react";
import type {ParsedIrcMessage} from "../../services/twitch";

interface ChatMessageProps {
    msg: ParsedIrcMessage;
    useColoredNames: boolean;
    highlightRoles: boolean;
    IsShowDeletedMessages: boolean;
}

export const ChatMessage: FC<ChatMessageProps> = ({
                                                      msg,
                                                      useColoredNames,
                                                      highlightRoles,
                                                      IsShowDeletedMessages
                                                  }) => {
    const isSystem = msg.tags["is-system"] === "1";
    const isDeleted = msg.tags["is-deleted"] === "1";

    // Скрытие удаленных сообщений
    if (isDeleted && !IsShowDeletedMessages) {
        return null;
    }

    // Фоновые стили для ролей
    const badges = msg.tags["badges"] || "";
    const isBroadcaster = badges.includes("broadcaster/");
    const isMod = badges.includes("moderator/") || msg.tags["mod"] === "1";
    const isVip = badges.includes("vip/");

    let containerClassName = "text-sm wrap-break-word leading-relaxed animate-fadeIn p-1 rounded transition-all";
    
    if (highlightRoles && !isSystem) {
        if (isBroadcaster) containerClassName += " bg-error/10 border-l-2 border-error pl-1.5";
        else if (isMod) containerClassName += " bg-success/10 border-l-2 border-success pl-1.5";
        else if (isVip) containerClassName += " bg-info/10 border-l-2 border-info pl-1.5";
    }

    // Стили для удаленных сообщений
    if (isDeleted) {
        containerClassName += " opacity-40 select-none";
    }

    const twitchColor = msg.tags.color;
    const nameStyle = useColoredNames && twitchColor ? {color: twitchColor} : undefined;
    const nameClassName = !nameStyle ? "font-bold text-primary mr-2" : "font-bold mr-2";

    // Системные сообщения
    if (isSystem) {
        return (
            <div className={`${containerClassName} text-warning/80 font-medium italic`}>
                <span className="text-xs text-base-content/40 mr-2 select-none">
                    {msg.timestamp}
                </span>
                <span className="mr-2">🔧 {msg.user}:</span>
                <span>{msg.text}</span>
            </div>
        );
    }

    // Текстовые сообщения
    return (
        <div className={containerClassName}>
            <span className="text-xs text-base-content/40 mr-2 select-none">
                {msg.timestamp}
            </span>
            <span className={nameClassName} style={nameStyle}>
                {msg.user}:
            </span>
            <span className={isDeleted ? "text-base-content/60" : "text-base-content"}>
                {msg.text}
            </span>
        </div>
    );
};
