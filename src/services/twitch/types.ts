import type { TwitchIrcCommandType } from './config.ts'

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

  /** Шестнадцатеричный RGB-код цвета никнейма (например, "#FF0000") */
  color?: string;

  /** Является ли пользователь сотрудником Twitch (из тегов badges или user-type: staff/admin) */
  isTwitchStaff?: boolean;
}
