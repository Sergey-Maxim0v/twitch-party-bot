import type {FC} from "react";
import {type ParsedIrcMessage, TwitchIrcCommand} from "../../services/twitch";
import {LuCircleAlert, LuGem, LuSparkles, LuSword, LuTwitch, LuWrench} from "react-icons/lu";

interface ChatMessageProps {
    msg: ParsedIrcMessage;
    useColoredNames: boolean;
    highlightRoles: boolean;
    IsShowDeletedMessages: boolean;
    showSystemNotifications: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({
                                               msg,
                                               useColoredNames,
                                               highlightRoles,
                                               IsShowDeletedMessages,
                                               showSystemNotifications
                                           }) => {
    const isSystem = msg.tags["is-system"] === "1";
    const isDeleted = msg.tags["is-deleted"] === "1";
    const isHighlightedMessage = msg.tags["msg-id"] === "highlighted-message";

    // Скрытие удаленных сообщений
    if (isDeleted && !IsShowDeletedMessages) {
        return null;
    }

    //  Скрытие системных уведомлений канала (подписки, рейды, режимы, баны)
    const isChannelEvent =
        msg.command === TwitchIrcCommand.NOTICE ||
        msg.command === TwitchIrcCommand.ROOM_STATE ||
        msg.command === TwitchIrcCommand.USER_NOTICE ||
        msg.command === TwitchIrcCommand.CLEAR_CHAT ||
        msg.command === TwitchIrcCommand.CLEAR_MSG ||
        msg.command === TwitchIrcCommand.GLOBAL_USER_STATE ||
        msg.command === TwitchIrcCommand.MOTD_START;

    if (isSystem && isChannelEvent && !showSystemNotifications) {
        return null;
    }

    // Фоновые стили для ролей
    const badges = msg.tags["badges"] || "";
    const isBroadcaster = badges.includes("broadcaster/");
    const isMod = badges.includes("moderator/") || msg.tags["mod"] === "1";
    const isVip = badges.includes("vip/");

    let containerClassName = "text-sm break-words leading-relaxed animate-fadeIn p-1 rounded transition-all block w-full";

    // Применяем фоновые цвета ролей
    if (highlightRoles && !isSystem) {
        if (isBroadcaster) containerClassName += " bg-error/10";
        else if (isMod) containerClassName += " bg-success/10";
        else if (isVip) containerClassName += " bg-info/10";
    }

    // Если сообщение выделено за баллы
    if (isHighlightedMessage && !isSystem) {
        containerClassName += " shadow-[inset_0_0_0_1.5px_theme(colors.primary)]";
    }

    // Стили для удаленных сообщений
    const deletedClassName = isDeleted ? ' opacity-40 select-none ' : ' '

    // Стили никнеймов
    const twitchColor = msg.tags.color;
    const nameStyle = useColoredNames && twitchColor ? {color: twitchColor} : undefined;
    const nameClassName = !nameStyle ? "font-bold text-primary mr-2 break-words" : "font-bold mr-2 break-words";

    // Системные сообщения
    if (isSystem) {
        const isAnnouncement = msg.tags["system-type"] === "announcement";
        const isAlert = msg.command === TwitchIrcCommand.USER_NOTICE && !isAnnouncement;

        let systemColorClass = "text-warning/80 font-medium italic";

        if (isAnnouncement) {
            systemColorClass = "text-secondary font-semibold"; // Красивый яркий цвет для анонса
        } else if (isAlert) {
            systemColorClass = "text-info font-medium"; // Цвет для подписок и рейдов
        }

        return (
            <div className={`${containerClassName} ${systemColorClass}`}>
                <span className="text-xs text-base-content/40 mr-2 select-none">
                    {msg.timestamp}
                </span>
                <span className="mr-2">
                    {isAlert || isAnnouncement ?
                        <LuSparkles className='w-4 h-4 inline align-middle'/>
                        :
                        <LuWrench className='w-4 h-4 inline align-middle'/>
                    }
                </span>
                <span className="mr-2">{msg.user}:</span>
                <span>{msg.text}</span>
            </div>
        );
    }

    // Текстовые сообщения
    const iconClassName = 'w-4 h-4 inline align-middle mr-1'

    return (
        <div className={`${containerClassName} ${deletedClassName} block w-full break-words`}>
            <span className="inline-block select-none mr-1.5 align-middle">
                <span className="text-xs text-base-content/40 mr-1.5">
                    {msg.timestamp}
                </span>

                {isDeleted && <LuCircleAlert className={iconClassName}/>}
                {isBroadcaster && <LuTwitch className={iconClassName}/>}
                {isMod && <LuSword className={iconClassName}/>}
                {isVip && <LuGem className={iconClassName}/>}
            </span>

            <span className={`${nameClassName} break-all inline align-middle`} style={nameStyle}>
                {msg.user}:
            </span>

            <span className={`${isDeleted ? "text-base-content/60" : "text-base-content"} inline align-middle ml-1.5`}>
                {msg.text}
            </span>
        </div>
    );
};

export default ChatMessage;

