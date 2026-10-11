import type { Dispatch, SetStateAction } from 'react'

export interface TwitchNotificationState {
  /** Уникальные никнеймы добавленных участников (Приоритет 1 - Высший) */
  joined: Set<string>;

  /** Уникальные никнеймы удаленных участников (Приоритет 2 - Выше среднего) */
  deleted: Set<string>;

  /** Уникальные никнеймы перемещенных участников (Приоритет 3 - Ниже среднего) */
  moved: Set<string>;

  /** Уникальные никнеймы участников, которым отказано (Приоритет 4 - Низший) */
  denied: Set<string>;
}

export type SetTwitchNotificationState = Dispatch<SetStateAction<TwitchNotificationState>>
