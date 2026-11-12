import type { ThemeMode } from '../hooks/types/theme.types.ts'
import { LuMoon, LuSun, LuSunMoon } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { TWITCH_CHAT_ACCESS_STATUSES } from './socket.constants.ts'

/**
 * Иконки режимов темы оформления.
 */
export const THEME_MODE_ICONS: Record<ThemeMode, IconType> = {
  nord: LuSun,
  dim: LuMoon,
  system: LuSunMoon,
}

/**
 * Типы окраски индикаторов статуса в стиле DaisyUI.
 */
export const STATUS_BADGE_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  NEUTRAL: 'neutral',
} as const

/**
 * Тексты статусов соединения и доступа к чату в шапке приложения.
 */
export const STATUS_TEXTS = {
  CONNECTED: 'Подключен',
  RESTRICTED: 'Ограничен',
  BANNED: 'Забанен',
  OFFLINE: 'Не подключен',
  CONNECTING: 'Ожидание',
  DISCONNECTED: 'Отключен',
} as const

/**
 * CSS-классы кнопки отправки сообщения в зависимости от доступности чата.
 */
export const TWITCH_CHAT_STATUS_BUTTON_CLASSES: Record<string, string> = {
  [TWITCH_CHAT_ACCESS_STATUSES.CONNECTED]: 'btn-primary',
  [TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED]: 'btn-warning text-black',
  [TWITCH_CHAT_ACCESS_STATUSES.OFFLINE]: 'btn-error text-white',
  [TWITCH_CHAT_ACCESS_STATUSES.BANNED]: 'btn-neutral',
}

/**
 * CSS-классы контейнера секции панели настроек очереди.
 */
export const SETTINGS_SECTION_CLASS = 'p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0'

/**
 * CSS-классы контейнера секции панели настроек очереди с дополнительным отступом.
 */
export const SETTINGS_SECTION_SPACED_CLASS = 'w-full min-w-0 space-y-3 p-3 rounded-xl bg-base-200/50 border border-base-300/60'

/**
 * CSS-классы кнопки опасного действия во всю ширину.
 */
export const DANGER_ACTION_BUTTON_CLASS = 'btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate'

/**
 * CSS-классы текстового поля ввода в панели настроек.
 */
export const SETTINGS_INPUT_CLASS = 'input input-bordered input-sm flex-1 min-w-0 text-sm focus:input-primary focus:outline-none'

/**
 * CSS-классы счётчика списка игроков.
 */
export const QUEUE_BADGE_CLASS = 'badge badge-neutral text-xs font-semibold'

/**
 * Параметры поля ввода сообщения в чат.
 */
export const CHAT_INPUT_STYLES = {
  /** Максимальная высота поля в пикселях, после которой появляется прокрутка. */
  MAX_HEIGHT_PX: 128,
  /** Минимальная высота поля ввода. */
  MIN_HEIGHT: '2rem',
} as const
