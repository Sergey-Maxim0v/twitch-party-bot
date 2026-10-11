import type { Dispatch, SetStateAction } from 'react'

export interface TwitchNotificationState {
  /** Уникальные никнеймы добавленных участников (Приоритет 1 - Высший) */
  joined: Set<string>;

  /** Уникальные никнеймы добавленных участников (Приоритет 2 - Выше среднего) */
  waiting: Set<string>;

  /** Уникальные никнеймы удаленных участников (Приоритет 3 - Средний) */
  deleted: Set<string>;

  /** Уникальные никнеймы перемещенных участников (Приоритет 4 - Ниже среднего) */
  moved: Set<string>;

  /** Уникальные никнеймы участников, которым отказано (Приоритет 5 - Низший) */
  denied: Set<string>;
}

export type SetTwitchNotificationState = Dispatch<SetStateAction<TwitchNotificationState>>
