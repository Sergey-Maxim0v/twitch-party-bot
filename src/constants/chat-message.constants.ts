import type { IconType } from 'react-icons'
import { LuGem, LuHeart, LuSword, LuTwitch } from 'react-icons/lu'

/** Ключ роли пользователя, влияющей на оформление сообщения. */
export type ChatMessageRoleKey =
  | 'isBroadcaster'
  | 'isModerator'
  | 'isSubscriber'
  | 'isVip'

/** Оформление роли в сообщении чата. */
export interface ChatMessageRole {
  /** Классы бейджа в стиле DaisyUI. */
  badgeClassName: string;
  /** Иконка роли. */
  icon: IconType;
  /** Ключ роли в данных пользователя. */
  key: ChatMessageRoleKey;
  /** Доступное название роли. */
  label: string;
  /** Классы подсветки сообщения в стиле DaisyUI. */
  messageClassName: string;
}

/** Классы оформления сообщений чата. */
export const CHAT_MESSAGE_STYLES = {
  BADGE: 'badge badge-sm badge-soft border-none px-1.5',
  BADGE_ICON: 'size-3',
  BASE: 'group block w-full break-words rounded-box px-3 py-2 transition-colors duration-200',
  COLORED_NAME: 'mr-2 inline break-all align-middle font-semibold text-[var(--light-color)] [:where([data-theme=dim])_&]:text-[var(--dark-color)]',
  DELETED: 'opacity-40 select-none',
  DELETED_ICON: 'size-3.5 text-error',
  DELETED_TEXT: 'ml-1.5 inline align-middle text-base-content/60',
  HIGHLIGHT: 'ring-2 ring-accent/40 shadow-sm',
  ICON: 'size-3.5',
  META: 'mr-1.5 inline-flex items-center gap-1.5 align-middle select-none',
  NAME: 'mr-2 inline break-all align-middle font-semibold text-primary',
  SCREEN_READER_ONLY: 'sr-only',
  SENDER: 'font-semibold text-base-content',
  SYSTEM: 'bg-base-200/30 text-xs',
  TEXT: 'ml-1.5 inline align-middle text-base-content',
  TIMESTAMP: 'font-mono text-xs text-base-content/40',
  USER: 'text-sm leading-relaxed hover:bg-base-200/40',
} as const

/** Виды системных сообщений. */
export const CHAT_MESSAGE_SYSTEM_KINDS = {
  ALERT: 'alert',
  ANNOUNCEMENT: 'announcement',
  DEFAULT: 'default',
} as const

/** Вид системного сообщения чата. */
export type ChatMessageSystemKind = typeof CHAT_MESSAGE_SYSTEM_KINDS[keyof typeof CHAT_MESSAGE_SYSTEM_KINDS]

/** Классы системных сообщений по их виду. */
export const CHAT_MESSAGE_SYSTEM_STYLES: Record<ChatMessageSystemKind, string> = {
  [CHAT_MESSAGE_SYSTEM_KINDS.ALERT]: 'font-medium text-info',
  [CHAT_MESSAGE_SYSTEM_KINDS.ANNOUNCEMENT]: 'font-semibold text-secondary',
  [CHAT_MESSAGE_SYSTEM_KINDS.DEFAULT]: 'font-medium italic text-warning',
}

/** Роли, влияющие на оформление сообщения, в порядке приоритета. */
export const CHAT_MESSAGE_ROLES: ChatMessageRole[] = [
  {
    badgeClassName: 'badge-error',
    icon: LuTwitch,
    key: 'isBroadcaster',
    label: 'Стример',
    messageClassName: 'bg-error/5',
  },
  {
    badgeClassName: 'badge-success',
    icon: LuSword,
    key: 'isModerator',
    label: 'Модератор',
    messageClassName: 'bg-success/5',
  },
  {
    badgeClassName: 'badge-info',
    icon: LuGem,
    key: 'isVip',
    label: 'VIP',
    messageClassName: 'bg-info/5',
  },
  {
    badgeClassName: 'badge-secondary',
    icon: LuHeart,
    key: 'isSubscriber',
    label: 'Подписчик',
    messageClassName: 'bg-secondary/5',
  },
]
