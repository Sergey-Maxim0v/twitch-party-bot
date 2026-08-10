export type QueueGameKey = 'LOL' | 'VALORANT' | 'CS';

export const QUEUE_GAMES: Record<QueueGameKey, string> = {
    LOL: "League of Legends",
    VALORANT: "Valorant",
    CS: "Counter-Strike"
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
