export type QueueGameKey =
    | 'RIOT'
    | 'STEAM'
    | 'UBISOFT'
    | 'BATTLE_NET'
    | 'APEX'
    | 'PUBG'
    | 'FORTNITE'
    | 'NARAKA'
    | 'GOOSE_GOOSE'
    | 'AMONG_US';

export const QUEUE_GAMES: Record<QueueGameKey, string> = {
    RIOT: "Riot Games",
    STEAM: "Steam",
    UBISOFT: "Ubisoft Connect",
    BATTLE_NET: "Battle.net",
    APEX: "Apex Legends",
    PUBG: "PUBG: Battlegrounds",
    FORTNITE: "Fortnite",
    NARAKA: "Naraka: Bladepoint",
    GOOSE_GOOSE: "Goose Goose Duck",
    AMONG_US: "Among Us"
};

export const GAME_PATTERNS: Record<QueueGameKey, string> = {
    RIOT: '^.{3,16}#[a-zA-Z0-9]{3,5}$',
    STEAM: '^.{2,32}$',
    UBISOFT: '^[a-zA-Z0-9._-]{3,15}$',
    BATTLE_NET: '^(?![0-9]).{3,12}#[0-9]+$',
    APEX: '^[a-zA-Z0-9_-]{4,16}$',
    PUBG: '^[a-zA-Z0-9]{4,16}$',
    FORTNITE: '^[a-zA-Z0-9а-яА-ЯёЁ_\\s-]{3,16}$',
    NARAKA: '^.{1,14}$',
    GOOSE_GOOSE: '^[a-zA-Z0-9а-яА-ЯёЁ]{1,16}$',
    AMONG_US: '^.{1,10}$'
};

export interface QueueCommandConfig {
    name: string;
    isModeratorOnly: boolean;
}

export interface QueueGameConfig {
    key: QueueGameKey;
    validationPattern: string;
}

export const DEFAULT_QUEUE_SETTINGS: QueueSettings = {
    isQueueOpen: false,
    maxQueueSize: 4,
    allowPreJoin: false,
    allowMultipleEntries: false,
    botMessageCooldown: 5,
    autoCloseOnFull: true,
    sessionHistoryCooldown: 0,
    gamesPlayedCooldown: 0,
    commands: {
        join: {name: '!join', isModeratorOnly: false},
        leave: {name: '!leave', isModeratorOnly: false},
        show: {name: '!show', isModeratorOnly: false},
        clear: {name: '!clear', isModeratorOnly: true},
        add: {name: '!add', isModeratorOnly: true},
        delete: {name: '!delete', isModeratorOnly: true},
    },
    banList: [],
};

export interface QueueSettings {
    /** Управление статусом очереди. */
    isQueueOpen: boolean;

    /** Лимит участников в очереди. */
    maxQueueSize: number;

    /** Разрешить заходить заранее (будущие очереди). */
    allowPreJoin: boolean;

    /** Разрешить несколько записей (будущие очереди). */
    allowMultipleEntries: boolean;

    /** Минимальное время ответа бота. */
    botMessageCooldown: number;

    /** Автоматическое закрытие очереди при ее заполнении. */
    autoCloseOnFull: boolean;

    /** Через сколько минут игрок может повторно участвовать. */
    sessionHistoryCooldown: number;

    /** Через сколько игр игрок может повторно участвовать. */
    gamesPlayedCooldown: number;

    /** Настройки команд: строки, сообщения с которыми бот будет обрабатывать. */
    commands: {
        /** Игрок присоединяется к очереди. */
        join: QueueCommandConfig;

        /** Игрок выходит из очереди. */
        leave: QueueCommandConfig;

        /** Бот пишет текущую очередь в чат. */
        show: QueueCommandConfig;

        /** Очистить текущую очередь. */
        clear: QueueCommandConfig;

        /** Добавить игрока в очередь. */
        add: QueueCommandConfig;

        /** Удалить игрока из очереди. */
        delete: QueueCommandConfig;
    };

    /** Выбор регулярного выражения для проверки игрового никнейма. */
    currentGame?: QueueGameConfig;

    /** Список никнеймов, сообщения которых бот не будет учитывать при построении очереди. */
    banList: string[];

    /** Доступ к очереди только для подписчиков. */
    subscribersOnly?: boolean;

    /** Автоматически ставить подписчиков в начало очереди. */
    prioritizeSubscribers?: boolean;

    /** Максимально возможное количество игр для одного участника. */
    maxGamesPerUser?: number;
}
