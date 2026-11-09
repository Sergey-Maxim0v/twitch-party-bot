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
    | 'AMONG_US'

interface QueueCommandConfig {
  name: string;
  isModeratorOnly: boolean;
}

export interface QueueGameConfig {
  key: QueueGameKey;
  validationPattern: string;
}

export interface QueueSettings {
  /** Лимит участников в очереди. */
  maxQueueSize: number;

  /** Разрешить список ожидающих. */
  allowPreJoin: boolean;

  /** Разрешить запись в список ожидающих участников текущей очереди. */
  allowMultipleEntries: boolean;

  /** Разрешить автоматически переносить игроков между ожидающими и текущей очередью при изменении размера очереди. */
  moveOnSizeChange: boolean;

  /** Задержка ответов бота об изменениях в составе очереди (сек) */
  botMessageCooldown: number;

  /** Через сколько минут игрок может повторно участвовать. */
  sessionHistoryCooldown: number;

  /** Через сколько игр игрок может повторно участвовать. */
  gamesPlayedCooldown: number;

  /** Префикс для автоматических сообщений об изменении в составе очереди. */
  messagePrefix?: string;

  /** Настройки команд: строки, сообщения с которыми бот будет обрабатывать. */
  commands: {
    /** Игрок присоединяется к очереди. */
    join: QueueCommandConfig;

    /** Игрок выходит из очереди. */
    leave: QueueCommandConfig;

    /** Бот пишет текущую очередь в чат. */
    show: QueueCommandConfig;

    /** Очистить очереди. */
    clear: QueueCommandConfig;

    /** Добавить игрока в очередь. */
    add: QueueCommandConfig;

    /** Удалить игрока из очереди. */
    delete: QueueCommandConfig;

    /** Открыть очередь. */
    start: QueueCommandConfig;

    /** Закрыть очередь. */
    stop: QueueCommandConfig;

    /** Завершить текущую очередь. */
    play: QueueCommandConfig;
  };

  /** Настройки разрешений для отправки ботом уведомлений в чат. */
  chatNotificationPermissions: {
    /** Общее разрешение на отправку любых сообщений ботом */
    allowSending: boolean;
    /** Отправка сообщений об открытии очереди */
    onQueueOpen: boolean;
    /** Отправка сообщений о закрытии очереди */
    onQueueClose: boolean;
    /** Отправка сообщений о добавлении нового участника в очередь */
    onMemberAdd: boolean;
    /** Отправка сообщений об удалении участника из очереди */
    onMemberRemove: boolean;
    /** Отправка сообщений о перемещении участника внутри очереди */
    onMemberMove: boolean;
    /** Отправка сообщений о полном заполнении очереди */
    onQueueFull: boolean;
    /** Отправка сообщений о полной очистке активного состава игроков */
    onClearActive: boolean;
    /** Отправка сообщений о полной очистке списка ожидающих участников */
    onClearWaiting: boolean;
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
