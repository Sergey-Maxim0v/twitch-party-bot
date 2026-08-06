import {CHAT_ACCESS_STATUSES, type ChatAccessStatus} from "../../../../services/socket/types";

/**
 * Конфигурация для индикатора "Доступность чата" (уровень прав аккаунта)
 */
export const getChatConfig = (chatAccessStatus: ChatAccessStatus) => {
    switch (chatAccessStatus) {
        case CHAT_ACCESS_STATUSES.CONNECTED:
            return {
                statusText: "Подключен",
                badgeType: "success" as const,
                tooltipText: "Чат: Полный доступ. Вы можете читать и отправлять сообщения без ограничений."
            };
        case CHAT_ACCESS_STATUSES.RESTRICTED:
            return {
                statusText: "Ограничен",
                badgeType: "warning" as const,
                tooltipText: "Чат: Аккаунт ограничен. Вы можете читать чат, но отправка сообщений заблокирована."
            };
        case CHAT_ACCESS_STATUSES.BANNED:
            return {
                statusText: "Забанен",
                badgeType: "error" as const,
                tooltipText: "Чат: Доступ заблокирован. Этот аккаунт был полностью забанен на целевом канале."
            };
        case CHAT_ACCESS_STATUSES.OFFLINE:
        default:
            return {
                statusText: "Не подключен",
                badgeType: "neutral" as const,
                tooltipText: "Чат: Инициализация не выполнена. Ожидание успешного сетевого соединения."
            };
    }
};
