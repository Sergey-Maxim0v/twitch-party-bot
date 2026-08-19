import type {LogInitiator} from "../queue/types.ts";

export const APP_LOG_STATUSES = {
    INFO: "info",
    SUCCESS: "success",
    WARNING: "warning",
    ERROR: "error",
} as const;

export type AppLogStatus = typeof APP_LOG_STATUSES[keyof typeof APP_LOG_STATUSES];

/**
 * Структура лога одного действия в очереди
 */
export interface AppLogItem {
    id: string;
    timestamp: number;
    /** Кто вызвал действие */
    initiator: LogInitiator;
    /** Никнейм того, кто инициировал */
    actorUsername: string;
    /** Исходный текст команды */
    rawCommand?: string;
    /** Текст, отображаемый в логах */
    message: string;
    /** Статус для подсветки в интерфейсе */
    status: AppLogStatus;
    /** Извлеченный никнейм по регулярке, если он был */
    extractedGameNickname?: string | null;
}
