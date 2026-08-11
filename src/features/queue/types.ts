/**
 * Данные игрока в очереди (слепок сообщения из чата)
 */
export interface QueuePlayer {
    /** Уникальный ID пользователя на Twitch */
    userId: string;
    /** Никнейм пользователя в чате (Display Name) */
    username: string;
    /** Статус подписки на момент входа в очередь */
    isSubscriber: boolean;
    /** Полный текст сообщения из чата */
    rawMessage: string;
    /** Точный timestamp получения сообщения ботом */
    timestamp: number;
    /** Извлеченный игровой никнейм */
    gameNickname?: string | null;
}

/**
 * Структура одной игровой сессии (состава)
 */
export interface QueueSession {
    /** Уникальный ID состава */
    id: string;
    /** Порядковое название для интерфейса */
    name: string;
    /** Время создания сессии */
    createdAt: number;
    /** Время, когда сессия была завершена/отправлена в историю */
    playedAt?: number;
    /** Список участников в этом конкретном составе */
    players: QueuePlayer[];
}

/**
 * Главный объект состояния всей очереди (хранится в localStorage)
 */
export interface QueueState {
    /** Текущий активный состав */
    currentSession: QueueSession | null;
    /** Будущие составы */
    futureSessions: QueueSession[];
    /** История сыгранных составов */
    historySessions: QueueSession[];
    /**
     * Быстрый индекс кулдаунов по времени.
     * Ключ — userId, значение — timestamp последней игры.
     */
    playerCooldownTimestamps: Record<string, number>;
    /** Массив логов очереди */
    logs: QueueLogItem[];
}

export type LogInitiator = 'chat_user' | 'chat_moderator' | 'streamer_ui';

export type LogStatus = 'success' | 'rejected' | 'info';

/** Структура лога одного действия   */
export interface QueueLogItem {
    id: string;
    timestamp: number;
    /** Кто вызвал действие  */
    initiator: LogInitiator;
    /** Никнейм того, кто инициировал */
    actorUsername: string;
    /** Исходный текст команды */
    rawCommand?: string;
    /** Текст отображаемый в логах  */
    message: string;
    /** Статус для подсветки в интерфейсе */
    status: LogStatus;
    /** Извлеченный никнейм по регулярке, если он был */
    extractedGameNickname?: string | null;
}

/** Типы возможных успешных исходов для логирования  */
export const JOIN_RESULT = {
    ADDED_TO_CURRENT: 'added_to_current',
    ADDED_TO_FUTURE_EXISTS_IN_CURRENT: 'added_to_future_exists_in_current',
    ADDED_TO_FUTURE: 'added_to_future',
    QUEUE_FULL: 'queue_full'
} as const;

export type JoinSuccessResult = typeof JOIN_RESULT[keyof typeof JOIN_RESULT];
