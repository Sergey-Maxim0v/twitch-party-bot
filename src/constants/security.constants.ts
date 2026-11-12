/**
 * Директивы Content-Security-Policy для production-сборки.
 *
 * CSP не применяется в dev-режиме: Vite использует inline-скрипты,
 * inline-стили и HMR WebSocket. `style-src` разрешает inline-стили,
 * потому что dnd-kit и цвета сообщений задаются через атрибут style.
 */
export const CSP_DIRECTIVES = {
  DEFAULT_SRC: "default-src 'self'",
  SCRIPT_SRC: "script-src 'self'",
  STYLE_SRC: "style-src 'self' 'unsafe-inline'",
  IMG_SRC: "img-src 'self' https://static-cdn.jtvnw.net data:",
  FONT_SRC: "font-src 'self'",
  CONNECT_SRC: "connect-src 'self' https://id.twitch.tv https://api.twitch.tv wss://irc-ws.chat.twitch.tv",
  WORKER_SRC: "worker-src 'self'",
  MANIFEST_SRC: "manifest-src 'self'",
  OBJECT_SRC: "object-src 'none'",
  BASE_URI: "base-uri 'none'",
  FORM_ACTION: "form-action 'self'",
} as const

/**
 * Значение заголовка Content-Security-Policy.
 */
export const CSP_CONTENT = Object.values(CSP_DIRECTIVES).join('; ')

/**
 * Атрибуты meta-тега с Content-Security-Policy.
 */
export const CSP_META = {
  HTTP_EQUIV: 'Content-Security-Policy',
  CONTENT: CSP_CONTENT,
} as const

/**
 * Параметры Vite-плагина, добавляющего CSP в собранный index.html.
 */
export const CSP_PLUGIN = {
  NAME: 'inject-csp-meta',
  APPLY: 'build',
  TAG: 'meta',
  INJECT_TO: 'head-prepend',
} as const
