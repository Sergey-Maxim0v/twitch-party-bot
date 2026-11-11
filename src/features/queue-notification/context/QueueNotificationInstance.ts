import { createContext } from 'react'
import type { SetTwitchNotificationState, TwitchNotificationState } from '../types.ts'

/**
 * Контракт контекста автоматических уведомлений о событиях очереди.
 */
export interface QueueNotificationContextType {
  /** Буфер уникальных участников, сгруппированных по типам событий. */
  notificationBuffer: TwitchNotificationState;

  /** Обновляет буфер уведомлений. */
  setNotificationBuffer: SetTwitchNotificationState;

  /** Добавляет участника в список подключившихся. */
  addJoinedUser: (username: string) => void;

  /** Добавляет участника в список ожидающих. */
  addWaitingUser: (username: string) => void;

  /** Добавляет участника в список удалённых. */
  addDeletedUser: (username: string) => void;

  /** Добавляет участника в список перемещённых в активную очередь. */
  addMovedToActiveUser: (username: string) => void;

  /** Добавляет участника в список перемещённых в ожидающие. */
  addMovedToWaitingUser: (username: string) => void;

  /** Добавляет участника в список отклонённых. */
  addDeniedUser: (username: string) => void;

  /** Отправляет сообщение; `true` — буфер можно очистить. */
  sendMessage: (text: string) => boolean;

  /** Отправляет сообщение об открытии очереди. */
  sendMessageOpen: () => void;

  /** Отправляет сообщение о закрытии очереди. */
  sendMessageClose: () => void;

  /** Отправляет сообщение о заполнении очереди. */
  sendQueueFullMessage: () => void;

  /** Отправляет сообщение об очистке активной очереди. */
  sendClearActive: () => void;

  /** Отправляет сообщение об очистке списка ожидающих. */
  sendClearWaiting: () => void;

  /** Очищает накопленный буфер уведомлений. */
  clearBuffer: () => void;

  /** Запускает циклический таймер отправки уведомлений. */
  startNotificationCycle: () => void;

  /** Останавливает циклический таймер отправки уведомлений. */
  stopNotificationCycle: () => void;

  /** Отправляет текущий статус активной очереди в чат Twitch. */
  sendCurrentQueueStatus: () => void;

  /** Сохраняет список никнеймов активной очереди для уведомлений. */
  setActiveQueueList: (val: string[]) => void;

  /** Сохраняет список никнеймов ожидающих для уведомлений. */
  setWaitingQueueList: (val: string[]) => void;
}

/** React-контекст автоматических уведомлений о событиях очереди. */
export const QueueNotificationContext = createContext<QueueNotificationContextType | undefined>(undefined)
