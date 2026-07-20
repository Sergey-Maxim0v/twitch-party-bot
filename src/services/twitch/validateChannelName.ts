/**
 * Проверяет имя канала Twitch на соответствие официальным правилам платформы.
 * Допускаются только буквы, цифры и подчеркивания, длина от 4 до 25 символов.
 */
export const validateChannelName = (name: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    const twitchUserRegex = /^[a-z0-9_]{4,25}$/;
    return twitchUserRegex.test(trimmed);
};
