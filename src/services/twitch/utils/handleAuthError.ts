import {TWITCH_AUTH_FAILED_NOTICE, TWITCH_IRC_NOTICE} from "../config.ts";

/**
 * Проверяет, содержит ли системная строка сообщение о сбое авторизации.
 * @returns {boolean} true — если обнаружена ошибка авторизации, false — в противном случае.
 */
export const handleAuthError = (line: string): boolean => {
    return line.includes(TWITCH_IRC_NOTICE) && line.includes(TWITCH_AUTH_FAILED_NOTICE);
};
