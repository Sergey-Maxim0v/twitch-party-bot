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

export interface QueueSettings {
    isQueueOpen: boolean;
    maxQueueSize: number;
    allowPreJoin: boolean;
    allowMultipleEntries: boolean;
    botMessageCooldown: number;
    autoCloseOnFull: boolean;
    sessionHistoryCooldown: number;
    gamesPlayedCooldown: number;
    commands: {
        join: QueueCommandConfig;
        leave: QueueCommandConfig;
        show: QueueCommandConfig;
        clear: QueueCommandConfig;
        add: QueueCommandConfig;
        delete: QueueCommandConfig;
    };
    currentGame?: QueueGameConfig;
    banList: string[];
    checkInTimeout?: number;
    requeueOnMiss?: boolean;
    subscribersOnly?: boolean;
    prioritizeSubscribers?: boolean;
    maxGamesPerUser?: number;
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
    currentGame: undefined,
    banList: []
};
