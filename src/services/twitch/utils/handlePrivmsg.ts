import {parseChatMessage, type ParsedMessage} from "../parseChatMessage.ts";
import {TWITCH_IRC_PRIVMSG} from "../config.ts";

/**
 * Обрабатывает IRC-строку сообщения PRIVMSG.
 * Извлекает теги, имя пользователя, текст сообщения и передает их в парсер контента.
 */
export const handlePrivmsg = (line: string): ParsedMessage | null => {
    if (!line.includes(TWITCH_IRC_PRIVMSG)) return null;

    // Регулярное выражение для извлечения тегов, имени пользователя и текста сообщения
    const match = line.match(/^(?:@([^\s]+)\s+)? :([^\s!]+)![^\s]+ PRIVMSG #[^\s]+ :([\s\S]*)$/);

    if (!match) return null;

    const rawTags = match[1] || '';
    const username = match[2];
    const messageText = match[3];

    // Парсим теги Twitch в объект (ключ=значение)
    const tags: Record<string, string> = {};
    if (rawTags) {
        rawTags.split(';').forEach(tag => {
            const [key, value] = tag.split('=');
            if (key) tags[key] = value || '';
        });
    }

    const displayName = tags['display-name'] || username;

    // Передаем очищенные данные в модульный парсер контента
    return parseChatMessage(messageText, username, displayName, tags);
};
