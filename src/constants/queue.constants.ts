import type { QueueGameKey, QueueSettings } from '../features/queue-settings/types.ts'
import type { QueuePlayerSource } from '../features/queue/types.ts'

/**
 * Источники появления игрока в очереди.
 */
export const QUEUE_PLAYER_SOURCE = {
  APP: 'app',
  MOD_CMD: 'mod_cmd',
  USER_CMD: 'user_cmd',
} as const

/**
 * Типы очередей в приложении.
 */
export const QUEUE_TYPES = {
  ACTIVE: 'active',
  WAITING: 'waiting',
  HISTORY: 'history',
} as const

/** Максимум игровых сессий в истории — ограничивает рост `twitch_queue_data`. */
export const QUEUE_HISTORY_LIMIT = 100

/** Максимум игроков в истории кулдаунов — ограничивает рост `twitch_queue_data`. */
export const PLAYER_HISTORY_LIMIT = 100

/**
 * Результат попытки присоединения игрока к очереди.
 */
export const QUEUE_JOIN_STATUSES = {
  JOINED: 'joined',
  WAITING: 'waiting',
  DENIED: 'denied',
} as const

/**
 * Оформление бейджа для источника появления игрока.
 */
interface QueuePlayerSourceMeta {
  /** Текстовая подпись источника. */
  label: string;
  /** CSS-классы бейджа. */
  badgeClass: string;
}

/**
 * Отображаемые названия и стили бейджей для источников появления игрока.
 */
export const QUEUE_PLAYER_SOURCE_META: Record<QueuePlayerSource, QueuePlayerSourceMeta> = {
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

/**
 * Отображаемые названия поддерживаемых игр.
 */
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

/**
 * Регулярные выражения для проверки игровых никнеймов.
 */
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

/**
 * Настройки очереди по умолчанию.
 */
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

/**
 * Подписи настроек очереди для журнала изменений и панели настроек.
 */
export const QUEUE_SETTING_LABELS = {
  maxQueueSize: 'Лимит участников в очереди',
  allowPreJoin: 'Разрешить запись в список ожидающих',
  allowMultipleEntries: 'Разрешить запись в список ожидающих участников текущей очереди',
  moveOnSizeChange: 'Разрешить автоперенос игроков из списка ожидающих при изменении размера очереди',
  sessionHistoryCooldown: 'Через сколько минут игрок может повторно участвовать',
  gamesPlayedCooldown: 'Через сколько игр игрок может повторно участвовать',
  maxGamesPerUser: 'Лимит игр для одного игрока',
  prioritizeSubscribers: 'Приоритет для подписчиков',
  subscribersOnly: 'Вход только для подписчиков',
  botMessageCooldown: 'Задержка ответов бота об изменениях в составе очереди (сек)',
} as const satisfies Partial<Record<keyof QueueSettings, string>>

/**
 * Подпись настройки префикса автоматических сообщений.
 */
export const QUEUE_MESSAGE_PREFIX_LABEL = 'Префикс для автоматических сообщений в чат Twitch'

/**
 * Подписи разрешений на отправку уведомлений для журнала изменений и панели настроек.
 */
export const QUEUE_NOTIFICATION_LABELS = {
  allowSending: 'Разрешить боту отправку сообщений в чат',
  onQueueOpen: 'Сообщение об открытии очереди (мгновенное)',
  onQueueFull: 'Сообщение об заполнении текущей очереди (мгновенное)',
  onQueueClose: 'Сообщение о закрытии очереди (мгновенное)',
  onMemberAdd: 'Сообщение о добавлении игрока в очередь (с задержкой)',
  onMemberRemove: 'Сообщение о удалении игрока из очереди (с задержкой)',
  onMemberMove: 'Сообщение о перемещении игрока между очередями (с задержкой)',
  onClearActive: 'Сообщение об очистке активного состава игроков (мгновенное)',
  onClearWaiting: 'Сообщение об очистке списка ожидающих (мгновенное)',
} as const satisfies Record<keyof QueueSettings['chatNotificationPermissions'], string>

/**
 * Подписи команд очереди для журнала изменений и панели настроек.
 */
export const QUEUE_COMMAND_LABELS = {
  join: 'Вступление в очередь',
  leave: 'Выход из очереди',
  show: 'Показать текущую очередь',
  clear: 'Очистить очереди',
  add: 'Добавить в очередь',
  delete: 'Удалить из очереди',
  start: 'Открыть очередь',
  stop: 'Закрыть очередь',
  play: 'Завершить текущую очередь',
} as const satisfies Record<keyof QueueSettings['commands'], string>

/**
 * Типы очередей, участвующих в операциях над списками игроков.
 */
type MutableQueueType = Exclude<typeof QUEUE_TYPES[keyof typeof QUEUE_TYPES], 'history'>

/**
 * Подписи типов очередей в родительном падеже для сообщений журнала.
 */
export const QUEUE_TYPE_LABELS = {
  active: 'активной очереди',
  waiting: 'списка ожидающих',
} as const satisfies Record<MutableQueueType, string>

/**
 * Подписи типов очередей в предложном падеже для сообщений журнала.
 */
export const QUEUE_TYPE_LABELS_LOCATIVE = {
  active: 'активной очереди',
  waiting: 'списке ожидающих',
} as const satisfies Record<MutableQueueType, string>

/**
 * Подписи типов очередей в винительном падеже для сообщений журнала.
 */
export const QUEUE_TYPE_LABELS_ACCUSATIVE = {
  active: 'активную очередь',
  waiting: 'список ожидающих',
} as const satisfies Record<MutableQueueType, string>

/**
 * Тексты системных сообщений об очистке очередей для журнала приложения.
 */
export const QUEUE_CLEAR_MESSAGES = {
  ACTIVE: 'Текущая очередь очищена.',
  WAITING: 'Список ожидающих очищен.',
} as const

/**
 * Тексты автоматических уведомлений в чат Twitch.
 */
export const QUEUE_CHAT_NOTIFICATION_MESSAGES = {
  CLEARED_ACTIVE: 'Очередь очищена.',
  CLEARED_WAITING: 'Список ожидающих очищен.',
  QUEUE_FULL: 'Очередь заполнена.',
  QUEUE_OPENED: 'Очередь открыта!',
  QUEUE_CLOSED: 'Очередь закрыта!',
} as const
