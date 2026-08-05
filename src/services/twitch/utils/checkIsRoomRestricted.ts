import type {ParsedIrcMessage} from "./parseIrcMessage";

/**
 * Проверяет теги сообщения ROOM_STATE на наличие активных ограничений чата
 * (режим подписчиков, режим смайлов или медленный режим).
 */
export const checkIsRoomRestricted = (message: ParsedIrcMessage): boolean => {
    const tags = message.tags || {};
    const isSubsOnly = tags["subs-only"] === "1";
    const isEmoteOnly = tags["emote-only"] === "1";
    const isSlowMode = tags["slow"] && tags["slow"] !== "0";

    return !!(isSubsOnly || isEmoteOnly || isSlowMode);
};
