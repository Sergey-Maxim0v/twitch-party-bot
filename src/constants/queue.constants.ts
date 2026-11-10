import type { QueueGameKey, QueueSettings } from '../features/queue-settings/types.ts'
import type { QueuePlayerSource } from '../features/queue/types.ts'

export const QUEUE_STORAGE_KEY = 'twitch_queue_data'

export const QUEUE_SETTINGS_STORAGE_KEY = 'twitch_queue_settings'

export const QUEUE_PLAYER_SOURCE = {
  APP: 'app',
  MOD_CMD: 'mod_cmd',
  USER_CMD: 'user_cmd',
}

export const QUEUE_TYPES = {
  ACTIVE: 'active',
  WAITING: 'waiting',
  HISTORY: 'history',
}

export const QUEUE_JOIN_STATUSES = {
  JOINED: 'joined',
  WAITING: 'waiting',
  DENIED: 'denied',
} as const

export const QUEUE_PLAYER_SOURCE_META: Record<
  QueuePlayerSource,
  { label: string; badgeClass: string }
> = {
  app: {
    label: 'Приложение',
    badgeClass: 'badge-info text-info-content',
  },
  mod_cmd: {
    label: 'Команда модератора',
    badgeClass: 'badge-secondary text-secondary-content',
  },
  user_cmd: {
    label: 'Команда из чата',
    badgeClass: 'badge-accent text-accent-content',
  },
}

export const QUEUE_GAME_DISPLAY_NAMES: Record<QueueGameKey, string> = {
  RIOT: 'Riot Games',
  STEAM: 'Steam',
  UBISOFT: 'Ubisoft Connect',
  BATTLE_NET: 'Battle.net',
  APEX: 'Apex Legends',
  PUBG: 'PUBG: Battlegrounds',
  FORTNITE: 'Fortnite',
  NARAKA: 'Naraka: Bladepoint',
  GOOSE_GOOSE: 'Goose Goose Duck',
  AMONG_US: 'Among Us',
}

export const QUEUE_GAME_NICKNAME_PATTERNS: Record<QueueGameKey, string> = {
  RIOT: '^.{3,16}#[a-zA-Z0-9]{3,5}$',
  STEAM: '^.{2,32}$',
  UBISOFT: '^[a-zA-Z0-9._-]{3,15}$',
  BATTLE_NET: '^(?![0-9]).{3,12}#[0-9]+$',
  APEX: '^[a-zA-Z0-9_-]{4,16}$',
  PUBG: '^[a-zA-Z0-9]{4,16}$',
  FORTNITE: '^[a-zA-Z0-9а-яА-ЯёЁ_\\s-]{3,16}$',
  NARAKA: '^.{1,14}$',
  GOOSE_GOOSE: '^[a-zA-Z0-9а-яА-ЯёЁ]{1,16}$',
  AMONG_US: '^.{1,10}$',
}

export const DEFAULT_QUEUE_SETTINGS: QueueSettings = {
  maxQueueSize: 4,
  allowPreJoin: false,
  allowMultipleEntries: false,
  moveOnSizeChange: true,
  botMessageCooldown: 5,
  sessionHistoryCooldown: 0,
  gamesPlayedCooldown: 0,
  messagePrefix: '🎮 [PartyBot]',
  commands: {
    join: { name: '!join', isModeratorOnly: false },
    leave: { name: '!leave', isModeratorOnly: false },
    show: { name: '!show', isModeratorOnly: false },
    clear: { name: '!clear', isModeratorOnly: true },
    add: { name: '!add', isModeratorOnly: true },
    delete: { name: '!delete', isModeratorOnly: true },
    start: { name: '!start', isModeratorOnly: true },
    stop: { name: '!stop', isModeratorOnly: true },
    play: { name: '!play', isModeratorOnly: true },
  },
  chatNotificationPermissions: {
    allowSending: false,
    onQueueOpen: true,
    onQueueClose: true,
    onMemberAdd: false,
    onMemberMove: false,
    onMemberRemove: false,
    onQueueFull: false,
    onClearActive: false,
    onClearWaiting: false,
  },
  banList: [],
  currentGame: undefined,
  subscribersOnly: false,
  prioritizeSubscribers: false,
  maxGamesPerUser: 0,
}

export const QUEUE_SETTING_LABELS: Record<string, string> = {
  maxQueueSize: 'Лимит участников в очереди',
  allowPreJoin: 'Разрешить запись в список ожидающих',
  allowMultipleEntries: 'Разрешить запись в список ожидающих участников текущей очереди',
  moveOnSizeChange: 'Автоперенос игроков из списка ожидающих при изменении размера очереди',
  sessionHistoryCooldown: 'Через сколько минут игрок может повторно участвовать',
  gamesPlayedCooldown: 'Через сколько игр игрок может повторно участвовать',
  maxGamesPerUser: 'Лимит игр для одного игрока',
  prioritizeSubscribers: 'Приоритет для подписчиков',
  subscribersOnly: 'Вход только для подписчиков',
  botMessageCooldown: 'Задержка ответов бота об изменениях в составе очереди (сек)',
}

export const QUEUE_NOTIFICATION_LABELS: Record<string, string> = {
  allowSending: 'Разрешить боту отправку сообщений в чат',
  onQueueOpen: 'Сообщение об открытии очереди',
  onQueueFull: 'Сообщение о заполнении текущей очереди',
  onQueueClose: 'Сообщение о закрытии очереди',
  onMemberAdd: 'Сообщение о добавлении игрока в очередь',
  onMemberRemove: 'Сообщение об удалении игрока из очереди',
  onMemberMove: 'Сообщение о перемещении игрока между очередями',
  onClearActive: 'Сообщение об очистке очереди',
  onClearWaiting: 'Сообщение об очистке списка ожидающих',
}

export const QUEUE_COMMAND_LABELS: Record<string, string> = {
  join: 'Вступление в очередь',
  leave: 'Выход из очереди',
  show: 'Показать текущую очередь',
  clear: 'Очистить очереди',
  add: 'Добавить в очередь',
  delete: 'Удалить из очереди',
  start: 'Открыть очередь',
  stop: 'Закрыть очередь',
  play: 'Завершить текущую очередь',
}
