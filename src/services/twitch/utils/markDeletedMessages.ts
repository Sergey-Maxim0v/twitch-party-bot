import type {ParsedIrcMessage} from "./parseIrcMessage.ts";
import {TwitchIrcCommand} from "../config.ts";

export interface markDeletedMessages {
    modMessage: ParsedIrcMessage,
    currentMessages: ParsedIrcMessage[]
}

export const markDeletedMessages = (
    {modMessage, currentMessages}: markDeletedMessages): ParsedIrcMessage[] => {
    const {command, text, tags} = modMessage;

    //  Полная очистка чата (CLEARCHAT без указания пользователя)
    if (command === TwitchIrcCommand.CLEAR_CHAT && !text?.trim()) {
        return currentMessages.map(msg => ({
            ...msg,
            tags: {...msg.tags, "is-deleted": "1", "mod-action": "clearchat"}
        }));
    }

    //  Бан или таймаут конкретного пользователя (CLEARCHAT с ником в text)
    if (command === TwitchIrcCommand.CLEAR_CHAT && text?.trim()) {
        const bannedUser = text.trim().toLowerCase();
        return currentMessages.map(msg =>
            msg.user.toLowerCase() === bannedUser
                ? {...msg, tags: {...msg.tags, "is-deleted": "1", "mod-action": "ban"}}
                : msg
        );
    }

    //  Удаление одного конкретного сообщения по его ID (CLEARMSG)
    if (command === TwitchIrcCommand.CLEAR_MSG) {
        const targetMsgId = tags["target-msg-id"];
        if (!targetMsgId) return currentMessages;

        return currentMessages.map(msg =>
            msg.id === targetMsgId
                ? {...msg, tags: {...msg.tags, "is-deleted": "1", "mod-action": "clearmsg"}}
                : msg
        );
    }

    // Если команда не связана с модерацией, возвращаем массив без изменений
    return currentMessages;
};
