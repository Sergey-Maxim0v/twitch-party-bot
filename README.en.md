# Twitch Party Bot

[![Language Switch](https://img.shields.io/badge/Language-Russian%20%7C%20English-blue)](README.md)

![GitHub language count](https://img.shields.io/github/languages/count/Sergey-Maxim0v/twitch-party-bot)
![GitHub top language](https://img.shields.io/github/languages/top/Sergey-Maxim0v/twitch-party-bot)
![GitHub repo size](https://img.shields.io/github/repo-size/Sergey-Maxim0v/twitch-party-bot)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Sergey-Maxim0v/twitch-party-bot)
![GitHub last commit](https://img.shields.io/github/last-commit/Sergey-Maxim0v/twitch-party-bot)

![React 19](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite 8](https://img.shields.io/badge/Vite-8-orange?logo=vite)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-teal?logo=tailwindcss)

[![Website](https://img.shields.io/badge/Website-Live-brightgreen?logo=globe)](https://sergey-maxim0v.github.io/twitch-party-bot/)
[![Deploy](https://github.com/Sergey-Maxim0v/twitch-party-bot/actions/workflows/deploy.yml/badge.svg)](https://github.com/Sergey-Maxim0v/twitch-party-bot/actions/workflows/deploy.yml)

[![GitHub license](https://img.shields.io/github/license/Sergey-Maxim0v/twitch-party-bot)](LICENSE)

---

<img src="public/screenshots/screenshot_1.png" width="70%" alt="screenshot"/>

---

**Twitch Party Bot** is a simple and intuitive tool for streamers designed to quickly gather viewers from the chat into a single party. The bot automatically manages the queue and collects players' nicknames for co-op games, saving you the trouble of doing it manually.

---

## How it works
1. **Viewers type a command** in the chat, such as `!join` (or any other custom command you set), and the bot automatically adds them to the list.
2. **You get a convenient dashboard** where you can see all interested viewers. You can easily add, reorder, or remove players directly via the UI.
3. **Waiting list:** You can open a pre-registration queue so that viewers can secure their spot in advance for the next game.
4. **Automated chat messages:** The bot posts updates when the queue opens, closes, gets full, or changes its lineup. Sending must be enabled in the settings — it is turned off by default.
5. **Flexible configuration:** Customize queue limits, chat commands, toggle automated chat messaging, and more.

---

## Features

* **Built-in Twitch chat:** message history, role highlighting, colored nicknames, system notifications, and deleted-message display.
* **Logs panel:** network events, app state, and queue changes.
* **Queue management:** active roster, waiting list, history, and drag-and-drop player reordering.
* **Three UI themes:** Nord, Dim, and System.
* **Flexible settings:** player limit, custom commands, moderator permissions, cooldowns, and a ban list.
* **Subscriber modes:** subscribers-only access and subscriber priority.
* **Nickname validation for 10 games and platforms:** Riot Games, Steam, Ubisoft Connect, Battle.net, Apex Legends, PUBG, Fortnite, Naraka: Bladepoint, Goose Goose Duck, and Among Us.
* **Automated chat messages:** sending can be enabled and fine-tuned in the settings panel.
* **Cross-tab synchronization:** queue and settings changes appear instantly in every open browser tab.

---

## Quick Start for Streamers

You can run the application in two ways:

* **🚀 Quick Launch (Recommended):** The app is already deployed and ready to go on GitHub Pages: **[sergey-maxim0v.github.io/twitch-party-bot](https://sergey-maxim0v.github.io/twitch-party-bot/)**. Just open the link, log in with your Twitch account (the bot only requires permissions to read and send chat messages), and select the channel where the bot should operate.
* **🛠 Local Setup:** You can run the project locally on your machine. Clone the repository and register your application in the **[Twitch Developer Console](https://dev.twitch.tv/console)**. When registering, specify the **OAuth Redirect URL** — the address where the app will run (locally, for example, `http://localhost:5173/`; on GitHub Pages, your page URL). Then create a `.env` file in the root directory, set your Client ID (`VITE_TWITCH_CLIENT_ID=your_id`), and run the project following the instructions below.
* **🍴 Forking the project:** If you deploy your own fork to GitHub Pages, set `VITE_TWITCH_CLIENT_ID` in **Settings → Secrets and variables → Actions → Variables** — the build workflow reads it from there. Also update `base` in `vite.config.ts` (currently `/twitch-party-bot/`) to `/your-repository-name/`, otherwise static assets will not load.

---

## Architecture & Technical Highlights

* **Authentication (Twitch OAuth):** OAuth authentication using the **Implicit Flow** (requested scopes: `chat:read` and `chat:edit`). Sign-in happens in a popup window, with a fallback to authorizing in the current tab when the browser blocks popups. The access token and session profile are stored in the tab's `sessionStorage`.
* **Network Layer (Twitch IRC WebSocket):** The app uses a custom lightweight client built on the standard IRC text protocol over WebSockets (`wss://irc-ws.chat.twitch.tv:443`) instead of a third-party chat library.
* **Socket Stability Management:**
    * The `TwitchIrcClient` class encapsulates the Twitch IRC protocol handshake sequence.
    * Handles native `PING / PONG` heartbeats to maintain a stable connection.
    * Supports switching channels on the fly without memory leaks or duplicated asynchronous events. When switching channels, the UI clears the previous screen and chat history.
    * Network outages are handled explicitly: the socket is closed, outgoing messages are rejected with a clear error instead of being silently lost, and the app reconnects on its own once the network is back.
* **Cross-Tab Synchronization:** Real-time application state synchronization across multiple tabs. A custom `useLocalStorage` hook listens to the browser's native `storage` event, automatically updating the state in all open tabs when data changes in any of them.
* **Background Timers (Web Worker):** Heartbeat timers (PING/PONG) run in a dedicated Web Worker so that the browser does not throttle them in an inactive tab and the bot detects a half-open connection in time. The IRC client itself runs on the main thread.

---

## Limitations & Privacy

* **No backend.** The app runs entirely in the browser: the bot reads and sends messages directly through Twitch IRC. No third-party servers are involved, and no analytics or trackers are used.
* **Local data only.** The OAuth token is stored in the tab's `sessionStorage`, while the queue and settings are kept in the browser's `localStorage`. Clearing site data resets everything, while logging out only clears the session.
* **Blocked storage.** If the browser denies Web Storage access (for example, in a sandboxed iframe or with storage disabled in settings), the UI still loads without errors, but the session and settings cannot be persisted — sign-in may be unavailable.
* **The bot runs only while the tab is open.** Closing the tab or browser stops chat responses. Keep the tab open while streaming.
* **No cross-device sync.** The queue and settings are shared only between tabs of the same browser.
* **Token lifetime.** With Implicit Flow, the Twitch token expires after a limited time and is not refreshed automatically; you will need to log in again.

---

## Dependencies

- **[React 19](https://react.dev) & [TypeScript](https://typescriptlang.org):** Frontend foundation built with React and TypeScript.
- **[Vite 8](https://vite.dev):** Build tool and development server.
- **[Tailwind CSS v4](https://tailwindcss.com) & [DaisyUI v5](https://daisyui.com):** Styling stack for UI components, themes, and the design system.
- **[@dnd-kit](https://dnd-kit.com):** Primitives for drag-and-drop player reordering.
- **[ESLint](https://eslint.org) & [Simple Git Hooks](https://github.com/toplenboren/simple-git-hooks):** Static code analysis and TypeScript type checking on the pre-commit hook.

## Environment Requirements

* **Node.js 24+** (the version used in CI) and npm.
* A modern browser with WebSocket and Web Worker support.
* For local development, an app registered in the Twitch Developer Console and `VITE_TWITCH_CLIENT_ID` set in `.env`.

## Build and Run Instructions

```bash
# Install all project dependencies
npm install

# Start the local development server
npm run dev

# Run TypeScript type checking (without emitting files)
npm run typecheck

# Codebase linting
npm run lint

# Automatically fix linting errors
npm run lint:fix

# Build the optimized production application
npm run build

# Preview the locally built production app
npm run preview
```

## Project Directory Structure

```plaintext
/
├── .github/                     # GitHub Actions and CI/CD workflow configurations
├── public/                      # Static assets (icons, screenshots)
├── src/                         # Main application source code
│   ├── components/              # Global and layout UI components
│   ├── constants/               # Configuration files and constants
│   ├── features/                # Isolated business logic modules
│   │   ├── app-logs/            # Components for logging network events, app state, and queue changes
│   │   ├── auth/                # OAuth authentication module and streamer context
│   │   ├── queue/               # Queue state management and player lists
│   │   ├── queue-notification/  # Dispatcher for sending trigger notifications to chat
│   │   └── queue-settings/      # QueueSettings configuration interface
│   ├── hooks/                   # Custom reusable React hooks
│   ├── services/                # Low-level infrastructure services
│   │   ├── socket/              # WebSocket integration layer and event bus
│   │   └── twitch/              # TwitchIrcClient class and background Web Worker
│   ├── utils/                   # Shared data formatting utilities
│   ├── App.tsx                  # Root application component
│   ├── index.css                # Global styles (Tailwind CSS v4 entry point)
│   └── main.tsx                 # React DOM mount entry point
├── eslint.config.js             # Flat ESLint configuration file
├── tsconfig.app.json            # TypeScript compiler specifications for the client app
├── vite.config.ts               # Vite bundler configuration and plugins setup
└── package.json                 # Project manifest, scripts, and dependency tree
```

---

Happy streaming! 🎥 Have great games! 🎮 Happy coding! 👨‍💻

---

## License

This project is licensed under the **[MIT](LICENSE)** License.
