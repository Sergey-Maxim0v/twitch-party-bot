import {TWITCH_IRC_CLEARCHAT} from '../config';

export interface ParsedBanEvent {
    isBanEvent: boolean;
    wasFullClear: boolean;
    targetUsername: string | null;
}

/**
 * Парсит IRC-строку события бана или очистки чата.
 * Выделяет полную очистку экрана или блокировку конкретного пользователя.
 */
export const parseBanEvent = (line: string): ParsedBanEvent => {
    const result: ParsedBanEvent = {
        isBanEvent: false,
        wasFullClear: false,
        targetUsername: null
    };

    if (!line.includes(TWITCH_IRC_CLEARCHAT)) return result;

    // Регулярное выражение для разбора строки протокола Twitch
    const regex = new RegExp(`^:tmi\\.twitch\\.tv ${TWITCH_IRC_CLEARCHAT} #[^\\s]+(?: :([^\\s]+))?$`);
    const match = line.match(regex);

    if (!match) return result;

    result.isBanEvent = true;

    if (match[1]) {
        result.targetUsername = match[1].toLowerCase();
    } else {
        result.wasFullClear = true;
    }

    return result;
};
