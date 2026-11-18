import { TWITCH_IRC_COMMANDS } from '../../constants/twitch.constants.ts'

export type TwitchIrcCommandType = typeof TWITCH_IRC_COMMANDS[keyof typeof TWITCH_IRC_COMMANDS]

/**
 * Функция отправки данных в сокет.
 * @returns `true`, если данные переданы сокету.
 */
export type SocketSender = (text: string) => boolean

export interface ParsedIrcMessage {
  /** Уникальный идентификатор сообщения (msg-id из тегов Twitch) */
  id: string;

  /** Данные пользователя, отправившего IRC-сообщение. */
  user: IrcUserData;

  /** Текст сообщения */
  text: string;

  /** Команда IRC (например, 'PRIVMSG', 'JOIN', 'USERSTATE') */
  command: TwitchIrcCommandType;

  /** Время отправки сообщения в формате HH:MM */
  timestamp: string;

  /** Дополнительные теги сообщения */
  tags: Record<string, string>;

  /** Флаг, указывающий, является ли сообщение системным */
  isSystem?: boolean;

  /** Флаг, указывающий, относится ли сообщение к событиям канала или модерации */
  isChannelEvent?: boolean;

  /** Флаг, указывающий, было ли сообщение удалено модератором (например, через CLEARMSG) */
  isDeleted?: boolean;

  /** Флаг, указывающий, выделено ли сообщение за баллы канала (тег msg-id: highlighted-message) */
  isHighlightedMessage?: boolean;

  /** Флаг, указывающий, является ли сообщение объявлением модератора/стримера (команда /announce) */
  isAnnouncement?: boolean;
}

/**
 * Диапазон эмоции в тексте сообщения.
 */
export interface EmoteRange {
  /** ID эмоции Twitch. */
  id: string;

  /** Индекс первого символа эмоции. */
  start: number;

  /** Индекс последнего символа эмоции. */
  end: number;
}

/**
 * Сегмент текста сообщения: обычный текст или эмоция Twitch.
 */
export type ChatMessageSegment =
  | { type: 'text'; text: string }
  | { type: 'emote'; id: string; name: string }

/**
 * Данные пользователя, отправившего IRC-сообщение.
 */
export interface IrcUserData {
  /** Уникальный числовой ID пользователя */
  userId?: string;

  /** Никнейм отправителя (в нижнем регистре) */
  nick: string;

  /** Никнейм отправителя для отображения в чате (с учетом регистра) */
  displayName?: string;

  /** Является ли пользователь владельцем канала (стримером) */
  isBroadcaster?: boolean;

  /** Является ли пользователь VIP-премиум подписчиком */
  isVip?: boolean;

  /** Является ли пользователь платным подписчиком (сабом) канала */
  isSubscriber?: boolean;

  /** Является ли пользователь модератором канала */
  isModerator?: boolean;

  /** Безопасный CSS-цвет никнейма (например, "#FF0000"); пусто, если цвет не задан или невалиден */
  color?: string;

  /** Является ли пользователь сотрудником Twitch (из тегов badges или user-type: staff/admin) */
  isTwitchStaff?: boolean;
}

/**
 * Колбэки отправленного сообщения.
 */
export interface SendChatMessageOptions {
  /** Подтверждено USERSTATE. */
  onConfirmed?: () => void;

  /** Не отправлено или отклонено Twitch. */
  onFailed?: (reason: string) => void;
}

/**
 * Сообщение, ожидающее подтверждения отправки.
 */
export interface PendingChatMessage extends SendChatMessageOptions {
  /** Текст отправленного сообщения. */
  text: string;

  /** Момент постановки в очередь, миллисекунды. */
  createdAt: number;
}

/**
 * Факты, из которых выводится статус доступа к чату.
 */
export interface ChatAccessFacts {
  /** Аккаунт забанен на канале. */
  isBanned: boolean;

  /** Twitch отклонил отправку сообщения по NOTICE. */
  isSendBlocked: boolean;

  /** Действует таймаут, отслеживаемый таймером. */
  isTimeoutActive: boolean;

  /** Теги состояния комнаты из последних ROOMSTATE. */
  roomTags: Record<string, string>;
}
