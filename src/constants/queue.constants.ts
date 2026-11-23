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

/** Префикс уникального идентификатора записи в очереди. */
export const QUEUE_ENTRY_ID_PREFIX = 'queue-entry'

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
 * Максимальная длина слова, которое проверяется правилом игры.
 * Все встроенные правила ограничены 32 символами, поэтому более длинные слова не проверяются.
 */
export const QUEUE_NICKNAME_MAX_LENGTH = 64

/**
 * Максимальная длина названия команды чата.
 */
export const QUEUE_COMMAND_NAME_MAX_LENGTH = 20

/**
 * Максимальная длина префикса автоматических сообщений.
 */
export const QUEUE_MESSAGE_PREFIX_MAX_LENGTH = 20

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
    start: { name: '!open', isModeratorOnly: true },
    stop: { name: '!close', isModeratorOnly: true },
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
 * Предупреждения о конфликте префикса автоматических сообщений и команды чата.
 */
export const QUEUE_PREFIX_CONFLICT_MESSAGES = {
  PREFIX: (commandName: string): string =>
    `Префикс совпадает с командой «${commandName}». Выберите другой префикс.`,
  COMMAND: (prefix: string): string =>
    `Команда совпадает с префиксом «${prefix}». Выберите другое имя команды.`,
} as const

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
 * Описания команд в сообщении об открытии очереди.
 */
export const QUEUE_COMMAND_CHAT_DESCRIPTIONS = {
  JOIN: 'для входа',
  LEAVE: 'для выхода',
  SHOW: 'для просмотра очереди',
  START: 'для открытия',
  STOP: 'для закрытия',
  PLAY: 'для завершения',
  CLEAR: 'для очистки',
  ADD: 'для добавления',
  DELETE: 'для исключения',
} as const

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
 * Тексты системных сообщений об открытии, закрытии и завершении очереди.
 */
export const QUEUE_SESSION_LOG_MESSAGES = {
  OPENED: 'Открыта очередь, участники чата могут добавляться.',
  ALREADY_OPENED: 'Отказано: очередь уже открыта.',
  CLOSED: 'Закрыта очередь, добавлять в очередь могут только модераторы в чате и пользователь приложения.',
  ALREADY_CLOSED: 'Отказано: очередь уже закрыта.',
  FINISHED: (sessionNumber: number, playersCount: number): string =>
    `Состав №${sessionNumber} завершен (игроков: ${playersCount}).`,
  FINISHED_CHAT_HEADER: 'Очередь завершена. Сейчас играют:',
  FINISHED_EMPTY: 'Не удалось завершить сессию: Очередь пуста.',
  AUTO_CLOSED_ON_FINISH: 'Очередь автоматически закрыта в связи с завершением сессии.',
  AUTO_CLOSED_ON_CHANNEL_CHANGE: 'Очередь автоматически закрыта в связи со сменой канала.',
} as const

/**
 * Тексты журнала для команд чата.
 */
export const QUEUE_CHAT_COMMAND_LOG_MESSAGES = {
  ACCESS_DENIED: (commandName: string): string =>
    `Отказано: недостаточно прав для команды «${commandName}».`,
  MISSING_TARGET: (commandName: string): string =>
    `Отказано: не указан никнейм для команды «${commandName}».`,
  INVALID_TARGET: (commandName: string): string =>
    `Отказано: некорректный никнейм в команде «${commandName}».`,
  STATUS_SHOWN: 'Запрошен показ сообщений.',
  CLEARED_ALL: 'Текущая очередь и список ожидающих очищены.',
} as const

/**
 * Тексты системных сообщений об очистке очередей для журнала приложения.
 */
export const QUEUE_CLEAR_MESSAGES = {
  ACTIVE: 'Текущая очередь очищена.',
  WAITING: 'Список ожидающих очищен.',
} as const

/**
 * Цели очистки очереди из панели настроек.
 */
export const QUEUE_CLEAR_TARGETS = ['active', 'waiting', 'history'] as const

/**
 * Цель очистки очереди.
 */
export type QueueClearTarget = typeof QUEUE_CLEAR_TARGETS[number]

/**
 * Тексты секции очистки очереди и окна подтверждения.
 */
export const QUEUE_CLEAR_UI = {
  SECTION_TITLE: 'Очистить очередь',
  CONFIRM: 'Очистить',
  CANCEL: 'Отмена',
  WARNING: 'Действие нельзя отменить.',
} as const

/**
 * Подписи кнопок и вопросы подтверждения для каждой цели очистки.
 */
export const QUEUE_CLEAR_TARGET_UI = {
  active: {
    LABEL: 'Очистить текущую очередь',
    QUESTION: 'Очистить текущую очередь?',
  },
  waiting: {
    LABEL: 'Очистить список ожидающих',
    QUESTION: 'Очистить список ожидающих?',
  },
  history: {
    LABEL: 'Очистить историю',
    QUESTION: 'Очистить историю?',
  },
} as const satisfies Record<QueueClearTarget, { LABEL: string; QUESTION: string }>

/**
 * Тексты автоматических уведомлений в чат Twitch.
 */
export const QUEUE_CHAT_NOTIFICATION_MESSAGES = {
  CLEARED_ALL: 'Текущая очередь и список ожидания очищены.',
  CLEARED_ACTIVE: 'Очередь очищена.',
  CLEARED_WAITING: 'Список ожидающих очищен.',
  QUEUE_FULL: 'Очередь заполнена.',
  QUEUE_OPENED: 'Очередь открыта!',
  QUEUE_CLOSED: 'Очередь закрыта!',
} as const

/**
 * Разделитель блоков в сообщениях бота.
 */
export const QUEUE_CHAT_MESSAGE_SEPARATOR = ' | '

/**
 * Заголовок сообщения о заполнении очереди.
 */
export const QUEUE_FULL_STATUS_HEADER = `${QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_FULL} Текущий состав:`

/**
 * Заголовок списка команд в сообщении об открытии очереди.
 */
export const QUEUE_COMMAND_LIST_TITLE = 'Доступные команды:'

/**
 * Подписи блоков сообщения о составе очереди.
 */
export const QUEUE_STATUS_MESSAGE_LABELS = {
  ACTIVE: 'В очереди:',
  WAITING: 'В ожидании:',
  EMPTY: 'Пуста.',
} as const

/**
 * Заголовки групп уведомлений о событиях очереди.
 */
export const QUEUE_NOTIFICATION_PART_TITLES = {
  JOINED: 'Добавлены',
  WAITING: 'Добавлены в ожидающие',
  DELETED: 'Удалены',
  MOVED_TO_ACTIVE: 'Перемещены в очередь',
  MOVED_TO_WAITING: 'Перемещены в ожидающие',
  DENIED: 'Отказано',
} as const

/**
 * Маркеры участников в уведомлениях о событиях очереди.
 */
export const QUEUE_NOTIFICATION_MEMBER_MARKS = {
  ACTIVE: '🟢@',
  WAITING: '🟡@',
  REMOVED: '🔴@',
} as const

/**
 * Префиксы сообщений журнала приложения по операциям со списками очереди.
 */
export const QUEUE_LOG_PREFIXES = {
  /** Операция добавления игрока в очередь. */
  JOIN: 'Добавление в очередь',
  /** Операция удаления игрока из очереди. */
  REMOVE: 'Удаление из очереди',
  /** Операция удаления игрока из всех очередей. */
  REMOVE_ALL: 'Удаление из всех очередей',
  /** Операция перемещения игрока. */
  MOVE: 'Перемещение игрока',
} as const

/**
 * Шаблоны сообщений журнала при добавлении игрока в очередь.
 */
export const QUEUE_JOIN_LOG_MESSAGES = {
  /** Игрок добавлен в активную очередь. */
  ACTIVE: (name: string): string => `${QUEUE_LOG_PREFIXES.JOIN}: Игрок ${name} добавлен в активную очередь.`,
  /** Игрок находится в бан-листе. */
  DENIED_BANNED: (name: string): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: ${name} - отклонено, игрок находится в бан-листе очереди`,
  /** Очередь закрыта. */
  DENIED_CLOSED: (): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, очередь закрыта`,
  /** Очередь доступна только подписчикам, VIP и модераторам. */
  DENIED_SUBSCRIBERS_ONLY: (): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, доступ к очереди только для подписчиков Twitch, VIP и модераторов `,
  /** Игрок уже в активной очереди, а список ожидающих отключён. */
  DENIED_ACTIVE: (name: string): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${name} уже в активной очереди, список ожидающих отключен.`,
  /** Активная очередь заполнена, а список ожидающих отключён. */
  DENIED_FULL: (): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, активная очередь заполнена, а список ожидающих отключен.`,
  /** Повторная запись игрока из активной очереди запрещена. */
  DENIED_REJOIN: (name: string): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${name} уже находится в активной очереди, повторная запись запрещена.`,
  /** Игрок уже есть и в активной очереди, и в списке ожидающих. */
  DENIED_ACTIVE_AND_WAITING: (name: string): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${name} уже находится и в активной очереди, и в списке ожидающих.`,
  /** Игрок уже есть в списке ожидающих. */
  DENIED_WAITING: (name: string): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${name} уже находится в списке ожидающих.`,
  /** Игрок из активной очереди добавлен в список ожидания. */
  PREJOIN: (name: string): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Игрок ${name} уже в активной очереди, добавлен в список ожидания.`,
  /** Игрок добавлен в список ожидания. */
  WAITING: (name: string): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Игрок ${name} добавлен в список ожидания.`,
  /** Игрок исчерпал лимит игр. */
  DENIED_MAX_GAMES: (name: string, gamesPlayed: number, maxGames: number): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${name} уже сыграл максимальное количество игр (${gamesPlayed}/${maxGames})`,
  /** У игрока ещё действует кулдаун по времени. */
  DENIED_TIME_COOLDOWN: (remainingMinutes: number): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, кулдаун времени (осталось ${remainingMinutes} мин.)`,
  /** Игроку нужно пропустить игры по кулдауну. */
  DENIED_GAMES_COOLDOWN: (remainingGames: number): string =>
    `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, кулдаун сыгранных игр (необходимо пропустить еще ${remainingGames} игр)`,
} as const

/**
 * Подписи позиции игрока в сообщениях журнала о перемещении.
 */
export const QUEUE_MOVE_LOG_POSITIONS = {
  /** Игрок вставлен в конец списка. */
  END: ' в конец',
  /** Игрок вставлен на конкретную позицию. */
  AT: (position: number): string => ` на позицию ${position}`,
} as const

/**
 * Шаблоны сообщений журнала при перемещении игрока между списками.
 */
export const QUEUE_MOVE_LOG_MESSAGES = {
  /** Игрок перемещён внутри одного списка. */
  WITHIN: (name: string, queueLabel: string, position: string): string =>
    `${QUEUE_LOG_PREFIXES.MOVE}: Игрок ${name} перемещен внутри ${queueLabel}${position}.`,
  /** Игрок перемещён в другой список. */
  CROSS: (name: string, fromLabel: string, toLabel: string, position: string): string =>
    `${QUEUE_LOG_PREFIXES.MOVE}: Игрок ${name} перенесен из ${fromLabel} в ${toLabel}${position}.`,
  /** Вытесненные игроки перенесены в начало списка ожидающих. */
  DISPLACED_TO_WAITING: (names: string): string =>
    `Очередь заполнена. В начало списка ожидающих перенесено: ${names}.`,
  /** Вытесненные игроки удалены, так как список ожидающих отключён. */
  DISPLACED_REMOVED: (names: string): string =>
    `Очередь заполнена. Удалено, так как список ожидающих отключен: ${names}.`,
  /** Вытесненные игроки удалены, так как уже есть в списке ожидающих. */
  DISPLACED_ALREADY_WAITING: (names: string): string =>
    `Очередь заполнена. Удалено из активной очереди, так как уже есть в ожидающих: ${names}.`,
  /** Игрок уже есть в целевом списке. */
  DUPLICATE: (name: string, queueLabel: string): string =>
    `${QUEUE_LOG_PREFIXES.MOVE}: Отклонено, игрок ${name} уже находится в ${queueLabel}.`,
  /** Целевой список ожидающих отключён. */
  WAITING_DISABLED: (): string =>
    `${QUEUE_LOG_PREFIXES.MOVE}: Отклонено, список ожидающих отключен.`,
  /** Игрок не найден в списках. */
  NOT_FOUND: (): string =>
    `${QUEUE_LOG_PREFIXES.MOVE}: Ошибка перемещения: игрок не найден в списках очередей.`,
} as const

/**
 * Шаблоны сообщений журнала при балансировке активной очереди и списка ожидающих.
 */
export const QUEUE_BALANCE_LOG_MESSAGES = {
  /** Игроки перенесены из активной очереди в начало списка ожидающих. */
  MOVED_TO_WAITING: (count: number): string =>
    `Активная очередь превысила лимит. В начало списка ожидающих перенесено игроков: ${count}.`,
  /** Лишние игроки удалены, так как список ожидающих отключён. */
  REMOVED_OVERFLOW: (count: number): string =>
    `Активная очередь превысила лимит. Удалено игроков: ${count}, так как список ожидающих отключен.`,
  /** Лишние игроки удалены из активной очереди, так как уже есть в ожидающих. */
  REMOVED_OVERFLOW_DUPLICATES: (count: number): string =>
    `Активная очередь превысила лимит. Удалено из активной очереди игроков: ${count}, так как они уже есть в ожидающих.`,
  /** Игроки перенесены из списка ожидающих в активную очередь. */
  MOVED_TO_ACTIVE: (count: number): string =>
    `Автоматически перенесено игроков из списка ожидающих в активную очередь: ${count}.`,
  /** Игроки оставлены в списке ожидающих из-за кулдауна или лимита игр. */
  SKIPPED_BY_RESTRICTION: (count: number): string =>
    `Пропущено из-за кулдауна или лимита игр: ${count}.`,
  /** Игроки оставлены в списке ожидающих из-за режима «только для подписчиков». */
  SKIPPED_BY_SUBSCRIBERS_ONLY: (count: number): string =>
    `Пропущено из-за режима «только для подписчиков»: ${count}.`,
} as const
