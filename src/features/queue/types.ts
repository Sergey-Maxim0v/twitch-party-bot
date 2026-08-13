/**
 * Источники инициации действий в очереди
 */
export const LOG_INITIATOR = {
    CHAT_USER: 'chat_user',
    CHAT_MODERATOR: 'chat_moderator',
    STREAMER_UI: 'streamer_ui',
} as const;

export type LogInitiator = typeof LOG_INITIATOR[keyof typeof LOG_INITIATOR];

/**
 * Статусы логов для подсветки в интерфейсе
 */
export const LOG_STATUS = {
    SUCCESS: 'success',
    REJECTED: 'rejected',
    INFO: 'info',
} as const;

export type LogStatus = typeof LOG_STATUS[keyof typeof LOG_STATUS];

/**
 * Типы возможных результатов добавления в очередь для логирования
 */
export const JOIN_RESULT = {
    ADDED_TO_CURRENT: 'added_to_current',
    ADDED_TO_FUTURE_EXISTS_IN_CURRENT: 'added_to_future_exists_in_current',
    ADDED_TO_FUTURE: 'added_to_future',
    QUEUE_FULL: 'queue_full',
} as const;

export type JoinSuccessResult = typeof JOIN_RESULT[keyof typeof JOIN_RESULT];

/**
 * Данные игрока в очереди (слепок сообщения из чата)
 */
export interface QueuePlayer {
    /** Уникальный ID пользователя на Twitch */
    userId: string;
    /** Никнейм пользователя в чате для системных проверок (обычно в нижнем регистре) */
    username: string;
    /** Красивый никнейм пользователя с сохранением регистра (Display Name из Twitch) */
    displayedUsername?: string;
    /** Статус подписки на момент входа в очередь */
    isSubscriber: boolean;
    /** Полный текст сообщения из чата */
    rawMessage: string;
    /** Время сообщения (из тегов Twitch или Date.now()) */
    timestamp: number;
    /** Извлеченный и валидированный игровой никнейм */
    gameNickname?: string | null;
}

/**
 * Структура одной игровой сессии (состава) в истории
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
 * Статистика истории игрока для расчета всех типов кулдаунов
 */
export interface PlayerHistoryStats {
    /** Последний timestamp, когда игрок заходил/играл */
    lastPlayedTimestamp: number;
    /** Порядковый номер сессии, в которой игрок сыграл последний раз */
    lastPlayedSessionNumber: number;
}

/**
 * Структура лога одного действия в очереди
 */
export interface QueueLogItem {
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
    status: LogStatus;
    /** Извлеченный никнейм по регулярке, если он был */
    extractedGameNickname?: string | null;
}

/**
 * Главный объект состояния всей очереди (для хранения в стейте / localStorage)
 */
export interface QueueState {
    /** Игроки в текущей активной очереди */
    activeQueue: QueuePlayer[];
    /** Игроки в будущих/ожидающих очередях */
    futureQueue: QueuePlayer[];
    /** История завершенных игровых сессий (составов) */
    queueHistory: QueueSession[];
    /** Общий счетчик созданных/сыгранных сессий для расчета кулдауна по играм */
    globalSessionCounter: number;
    /** Быстрый индекс истории игроков для проверки временных и сессионных кулдаунов */
    playerHistory: Record<string, PlayerHistoryStats>;
    /** Массив логов действий очереди */
    queueLogs: QueueLogItem[];
}

/**
 * Роли исполнителей действий для понятного отображения в логах
 */
export const LOG_ACTOR_ROLE = {
    STREAMER: 'стример',
    MODERATOR: 'модератор',
    SYSTEM: 'система',
    APPLICATION: 'приложение',
} as const;

export type LogActorRole = typeof LOG_ACTOR_ROLE[keyof typeof LOG_ACTOR_ROLE];
