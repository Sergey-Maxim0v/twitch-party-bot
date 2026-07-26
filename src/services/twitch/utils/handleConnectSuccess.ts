import {TWITCH_IRC_READY_CODE} from '../config';

/**
 * Проверяет, является ли входящая строка подтверждением успешного подключения к каналу.
 */
export const handleConnectSuccess = (line: string): boolean => {
    return line.includes(` ${TWITCH_IRC_READY_CODE} `);
};
