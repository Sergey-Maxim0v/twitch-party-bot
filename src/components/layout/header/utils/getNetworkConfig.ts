import {CONNECTION_STATUSES, type ConnectionStatus} from "../../../../services/socket/types.ts";

/**
 * Конфигурация для индикатора "Соединение" (сетевой уровень)
 */
export const getNetworkConfig = (connectionStatus: ConnectionStatus) => {
    switch (connectionStatus) {
        case CONNECTION_STATUSES.CONNECTED:
            return {
                statusText: "Подключен",
                badgeType: "success" as const,
                tooltipText: "Сеть: Стабильное WebSocket-соединение с сервером Twitch IRC установлено. Ошибок нет."
            };
        case CONNECTION_STATUSES.CONNECTING:
            return {
                statusText: "Ожидание",
                badgeType: "warning" as const,
                tooltipText: "Сеть: Выполняется подключение к серверам Twitch... Пожалуйста, подождите."
            };
        case CONNECTION_STATUSES.DISCONNECTED:
        default:
            return {
                statusText: "Отключен",
                badgeType: "error" as const,
                tooltipText: "Сеть: Соединение с сервером отсутствует. Проверьте интернет или статус авторизации."
            };
    }
};
