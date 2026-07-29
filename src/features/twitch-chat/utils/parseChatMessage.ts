/**
 * @file Модуль парсинга сообщений чата Twitch.
 * Разбирает входящий текст на команды, аргументы, упоминания и ссылки.
 */

/**
 * Структура обработанного сообщения из чата.
 */
export interface ParsedMessage {
    rawText: string;
    isCommand: boolean;
    commandName: string;
    commandArgs: string[];
    commandArgsString: string;
    mentions: string[];
    urls: string[];
}

/**
 * Парсит сырой текст сообщения из чата Twitch и извлекает из него команды и метаданные.
 *
 * @param {string} text - Сырой текст сообщения от пользователя.
 * @param {string} [prefix='!'] - Символ-префикс, с которого должна начинаться команда.
 * @returns {ParsedMessage} Объект с подробной структурой разобранного сообщения.
 */
export const parseChatMessage = (text: string, prefix: string = '!'): ParsedMessage => {
    const trimmedText = text.trim();

    const result: ParsedMessage = {
        rawText: text,
        isCommand: false,
        commandName: '',
        commandArgs: [],
        commandArgsString: '',
        mentions: [],
        urls: []
    };

    if (!trimmedText) return result;

    // 1. Поиск упоминаний пользователей (@username)
    const mentionRegex = /@([a-zA-Z0-9_]{4,25})/g;
    let mentionMatch;
    while ((mentionMatch = mentionRegex.exec(trimmedText)) !== null) {
        result.mentions.push(mentionMatch[1].toLowerCase());
    }

    // 2. Поиск веб-ссылок (простой URL regex)
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const urlMatches = trimmedText.match(urlRegex);
    if (urlMatches) {
        result.urls = urlMatches;
    }

    // 3. Проверка и парсинг команды бота
    if (trimmedText.startsWith(prefix)) {
        const tokens = trimmedText.slice(prefix.length).split(/\s+/);

        if (tokens.length && tokens[0] !== '') {
            result.isCommand = true;
            result.commandName = tokens[0].toLowerCase();
            result.commandArgs = tokens.slice(1);
            result.commandArgsString = result.commandArgs.join(' ');
        }
    }

    return result;
};
