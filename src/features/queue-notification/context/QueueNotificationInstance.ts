import { createContext } from 'react'
import type { SetTwitchNotificationState, TwitchNotificationState } from '../types.ts'

export interface QueueNotificationContextType {
  /** Текущее состояние буфера уникальных участников, сгруппированных по типам событий */
  notificationBuffer: TwitchNotificationState;

  /** Функция обновления состояния буфера уведомлений */
  setNotificationBuffer: SetTwitchNotificationState;

  /** Добавить пользователя в список подключившихся (joined) */
  addJoinedUser: (username: string) => void;

  /** Добавить пользователя в список ожидающих (waiting) */
  addWaitingUser: (username: string) => void;

  /** Добавить пользователя в список удаленных (deleted) */
  addDeletedUser: (username: string) => void;

  /** Добавить пользователя в список перемещенных (moved) */
  addMovedUser: (username: string) => void;

  /** Добавить пользователя в список отклоненных (denied) */
  addDeniedUser: (username: string) => void;

  /** Отправить мгновенное текстовое сообщение в указанный канал Twitch */
  sendMessage: ( text: string) => void;

  /** Отправить мгновенное текстовое сообщение в указанный канал Twitch об открытии очереди */
  sendMessageOpen: ( ) => void;

  /** Отправить мгновенное текстовое сообщение в указанный канал Twitch о закрытии очереди  */
  sendMessageClose: ( ) => void;

  /** Очистить накопленный буфер уведомлений */
  clearBuffer: () => void;

  /** Запустить циклический таймер периодической отправки уведомлений */
  startNotificationCycle: () => void;

  /** Остановить циклический таймер периодической отправки уведомлений */
  stopNotificationCycle: () => void;

  /** Сформировать и отправить текущий статус активной очереди в чат Twitch */
  sendCurrentQueueStatus: () => void;

  /** Метод сохранения массива никнеймов текущей очереди для уведомления */
  setActiveQueueList: (val: string[]) => void;

  /** Метод сохранения массива никнеймов списка ожидающих для уведомления */
  setWaitingQueueList: (val: string[]) => void;
}

export const QueueNotificationContext = createContext<QueueNotificationContextType | undefined>(undefined)
