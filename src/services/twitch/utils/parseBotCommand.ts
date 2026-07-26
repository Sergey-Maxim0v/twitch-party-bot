import type {ParsedMessage} from "../parseChatMessage.ts";

export interface BotCommandResult {
    isCommand: ParsedMessage["isCommand"];
    commandName: ParsedMessage["commandName"];
    commandArgs: ParsedMessage["commandArgs"];
    commandArgsString: ParsedMessage["commandArgsString"];
}

/**
 * Проверяет, является ли текст командой бота, и парсит ее имя и аргументы.
 * Принимает на вход текст и символ-префикс (по умолчанию '!').
 */
export const parseBotCommand = (text: string, prefix: string = '!'): BotCommandResult => {
    const trimmedText = text.trim();

    const result: BotCommandResult = {
        isCommand: false,
        commandName: '',
        commandArgs: [],
        commandArgsString: ''
    };

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
