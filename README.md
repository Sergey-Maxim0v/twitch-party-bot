# Twitch-party-bot

![GitHub language count](https://img.shields.io/github/languages/count/Sergey-Maxim0v/twitch-party-bot)
![GitHub top language](https://img.shields.io/github/languages/top/Sergey-Maxim0v/twitch-party-bot)
![GitHub repo size](https://img.shields.io/github/repo-size/Sergey-Maxim0v/twitch-party-bot)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Sergey-Maxim0v/twitch-party-bot)

![GitHub last commit](https://img.shields.io/github/last-commit/Sergey-Maxim0v/twitch-party-bot)

---

<!-- TODO: ![screenshot](public/screenshot.png) -->

<!-- TODO: description -->

---

## Scripts

```bash
# Start the development server
npm run dev
```

```bash
# Build for production
npm run build
```

```bash
# Formats your code 
npm run lint
```

```bash
# Preview the build
npm run preview
```

---

## Структура проекта

```plaintext
src/
├── assets/             # Статические ресурсы (логотипы, иконки, звуки уведомлений)
├── components/         # Общие переиспользуемые UI-компоненты (UI Кит)
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── layout/         # Компоненты разметки
│       ├── Header.tsx
│       └── Footer.tsx
├── features/           # Основные изолированные бизнес-фичи приложения
│   ├── auth/           # Модуль авторизации Twitch
│   │   ├── components/
│   │   │   ├── LoginButton.tsx
│   │   │   └── AuthStatus.tsx
│   │   ├── hooks/
│   │   │   └── useTwitchAuth.ts
│   │   └── types/
│   │       └── auth.types.ts
│   └── queue/          # Модуль управления очередью (Party Queue)
│       ├── components/
│       │   ├── QueueList.tsx
│       │   ├── QueueControls.tsx
│       │   └── JoinForm.tsx
│       ├── hooks/
│       │   └── useQueue.ts
│       └── types/
│           └── queue.types.ts
├── hooks/              # Глобальные независимые хуки (тема, localStorage и т.д.)
│   └── useTheme.ts
├── types/              # Глобальные общие типы приложения
│   └── theme.types.ts
├── App.tsx             # Корневой компонент приложения
├── index.css           # Глобальные стили (Tailwind CSS v4 + DaisyUI)
└── main.tsx            # Точка входа React приложения
```