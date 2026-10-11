import { createContext } from 'react'
import type { SetTwitchNotificationState, TwitchNotificationState } from '../types.ts'

export interface QueueNotificationContextType {
  /** Текущее состояние буфера уникальных участников, сгруппированных по типам событий */
  state: TwitchNotificationState;

  /** Сеттер для управления состоянием буфера накопления */
  setState: SetTwitchNotificationState;

  /**
   * Отправляет мгновенное произвольное сообщение в чат Twitch.
   */
  sendMessage: (channel: string, text: string) => void;

  /**
   * Полностью очищает накопленный буфер событий (очищает все внутренние наборы Set)
   */
  clearMessage: () => void;

  /**
   * Запускает циклический таймер (setInterval) периодической отправки сообщений в чат Twitch.
   */
  startCycle: () => void;

  /**
   * Останавливает циклический таймер отправки сообщений в чат Twitch и очищает интервал.
   */
  stopCycle: () => void;

  /**
   * Формирует и отправляет в чат мгновенное сообщение с текущим составом активных участников очереди.
   */
  sendCurrentQueueStatus: () => void;
}

export const QueueNotificationContext = createContext<QueueNotificationContextType | undefined>(undefined)
