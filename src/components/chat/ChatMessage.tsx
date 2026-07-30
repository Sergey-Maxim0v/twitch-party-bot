import type {FC} from "react";
import type {ParsedIrcMessage} from "../../services/twitch";

interface ChatMessageProps {
    msg: ParsedIrcMessage;
    useColoredNames: boolean;
}

export const ChatMessage: FC<ChatMessageProps> = ({msg, useColoredNames}) => {
    const twitchColor = msg.tags.color;

    const nameStyle = useColoredNames && twitchColor ? {color: twitchColor} : undefined;

    const nameClassName = !nameStyle ? "font-bold text-primary mr-2" : "font-bold mr-2";

    return (
        <div className="text-sm wrap-break-word leading-relaxed animate-fadeIn">
            <span className="text-xs text-base-content/40 mr-2 select-none">
                {msg.timestamp}
            </span>
            <span className={nameClassName} style={nameStyle}>
                {msg.user}:
            </span>
            <span className="text-base-content">
                {msg.text}
            </span>
        </div>
    );
};
