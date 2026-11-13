/**
 * Ключи localStorage для состояния панелей рабочего пространства.
 */
export const PANEL_STORAGE_KEYS = {
  SETTINGS_OPEN: 'panel_settings_open',
  QUEUE_OPEN: 'panel_queue_open',
  LOGS_OPEN: 'panel_logs_open',
  CHAT_OPEN: 'panel_chat_open',
} as const

/**
 * Ключи localStorage для настроек отображения чата Twitch.
 */
export const TWITCH_CHAT_STORAGE_KEYS = {
  COLORED_NAMES: 'twitch_chat_colored_names',
  HIGHLIGHT_ROLES: 'twitch_chat_highlight_roles',
  SHOW_MODERATION_LOGS: 'twitch_chat_show_moderation_logs',
  SHOW_SYSTEM_NOTIFICATIONS: 'twitch_chat_show_system_notifications',
  HIGHLIGHT_MESSAGES: 'twitch_chat_highlight_messages',
} as const

/**
 * Ключ localStorage для выбранного режима темы оформления.
 */
export const THEME_STORAGE_KEY = 'twitch_party_theme'

/**
 * Ключи localStorage для состояния очереди и её настроек.
 */
export const QUEUE_STORAGE_KEYS = {
  DATA: 'twitch_queue_data',
  STATUS: 'twitch_queue_status',
  SETTINGS: 'twitch_queue_settings',
} as const

/**
 * Ключи Web Storage для состояния авторизации Twitch.
 */
export const AUTH_STORAGE_KEYS = {
  /** Сессия текущей вкладки в sessionStorage. */
  SESSION: 'tqp_twitch_session_v2',
  /** Устаревшая сессия в localStorage, которую удаляет миграция. */
  LEGACY_SESSION: 'tqp_twitch_session',
  ACTIVE_CHANNEL: 'tqp_active_channel',
} as const

/**
 * Ключ и значение для проверки доступности Web Storage.
 */
export const WEB_STORAGE_PROBE = {
  KEY: '__tqp_web_storage_probe__',
  VALUE: '1',
} as const

/**
 * Тексты ошибок доступа к Web Storage.
 */
export const WEB_STORAGE_ERRORS = {
  ACCESS: 'Web Storage недоступен',
  READ: 'Ошибка чтения Web Storage',
  WRITE: 'Ошибка записи в Web Storage',
  REMOVE: 'Ошибка удаления из Web Storage',
  PARSE: 'Ошибка разбора значения Web Storage',
  SERIALIZE: 'Ошибка сериализации значения для Web Storage',
} as const
