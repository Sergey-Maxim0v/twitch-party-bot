import {parseBotCommand} from "./utils/parseBotCommand.ts";
import {extractMentions} from "./utils/extractMentions.ts";
import {extractUrls} from "./utils/extractUrls.ts";
import {TWITCH_DEFAULT_COLOR} from "../../constants";

export interface ParsedMessage {
    id: string;                // Уникальный ID сообщения (для key в React списках)
    username: string;          // Логин отправителя
    displayName: string;       // Красивое имя пользователя
    rawText: string;           // Полный чистый текст сообщения
    timestamp: number;         // Время получения
    color: string;             // Цвет ника из Twitch тегов
    
    isBanned: boolean;

    // Результаты анализа текста
    isCommand: boolean;
    commandName: string;
    commandArgs: string[];
    commandArgsString: string;
    mentions: string[];
    urls: string[];
}

/**
 * Главный парсер текстового контента сообщений.
 *  * @see {@link https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchatmessage| EventSub Subscription Types - Twitch Developers}
 */
export const parseChatMessage = (
    text: string,
    username: string = '',
    displayName: string = '',
    tags: Record<string, string> = {},
    prefix: string = '!'
): ParsedMessage => {
    const commandResult = parseBotCommand(text, prefix);
    const mentions = extractMentions(text);
    const urls = extractUrls(text);

    return {
        id: tags['id'] || crypto.randomUUID(),
        username: username.toLowerCase(),
        displayName: displayName || username,
        rawText: text,
        timestamp: tags['tmi-sent-ts'] ? parseInt(tags['tmi-sent-ts'], 10) : Date.now(),
        color: tags['color'] || TWITCH_DEFAULT_COLOR,
        isBanned: false,

        isCommand: commandResult.isCommand,
        commandName: commandResult.commandName,
        commandArgs: commandResult.commandArgs,
        commandArgsString: commandResult.commandArgsString,

        mentions,
        urls
    };
};
