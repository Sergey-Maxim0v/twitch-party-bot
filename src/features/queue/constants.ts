import type { QueuePlayerSource } from './types.ts'

export const STORAGE_KEY = 'twitch_queue_data'

export const QUEUE_SOURCE_META: Record<
  QueuePlayerSource,
  { label: string; badgeClass: string }
> = {
  app: {
    label: 'Приложение',
    badgeClass: 'badge-info text-info-content',
  },
  mod_cmd: {
    label: 'Команда модератора',
    badgeClass: 'badge-secondary text-secondary-content',
  },
  user_cmd: {
    label: 'Команда из чата',
    badgeClass: 'badge-accent text-accent-content',
  },
}
