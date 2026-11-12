import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { CSP_META, CSP_PLUGIN } from './src/constants/security.constants.ts'
import pkg from './package.json' with { type: 'json' }

/**
 * Добавляет CSP в собранный index.html.
 *
 * В dev-режиме CSP отключён: Vite использует inline-скрипты,
 * inline-стили и HMR WebSocket.
 */
const cspPlugin = (): Plugin => ({
  name: CSP_PLUGIN.NAME,
  apply: CSP_PLUGIN.APPLY,
  transformIndexHtml: () => [
    {
      tag: CSP_PLUGIN.TAG,
      attrs: {
        'http-equiv': CSP_META.HTTP_EQUIV,
        'content': CSP_META.CONTENT,
      },
      injectTo: CSP_PLUGIN.INJECT_TO,
    },
  ],
})

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cspPlugin(),
  ],
  base: '/twitch-party-bot/',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
})
