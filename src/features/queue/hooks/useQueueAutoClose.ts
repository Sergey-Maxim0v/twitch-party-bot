import { type Dispatch, type SetStateAction, useEffect } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useOnWindowUnload } from '../../../hooks/useOnWindowUnload.ts'
import { APP_LOG_STATUSES, type AppLogStatus, LOG_SOURCE, type LogSource } from '../../app-logs/types.ts'

/**
 * Аргументы для лог-сообщения, передаваемого в функцию pushLog.
 */
interface LogMessagePayload {
  message: string
  status: AppLogStatus
  source: LogSource
  actorUsername: string
}

/**
 * Свойства для инициализации хука автоматического закрытия очереди.
 */
export interface UseAutocloseQueueProps {
  /** Текущий статус активности очереди. */
  isQueueOpen: boolean
  /** Функция изменения статуса активности очереди. */
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>
  /** Функция для отправки системных логов приложения. */
  pushLog: (payload: LogMessagePayload) => void
}

/**
 * Кастомный хук для автоматического закрытия очереди зрителей.
 */
export const useQueueAutoClose = ({ setIsQueueOpen, isQueueOpen, pushLog }: UseAutocloseQueueProps): void => {
  const { activeChannel, userDisplayName, session } = useAuth()

  // Вычисляем имя текущего инициатора действия для логирования
  const actorUsername = userDisplayName ?? session?.login ?? 'Application'

  // Сценарий 1: Обработка закрытия вкладки, браузера или перезагрузки страницы
  useOnWindowUnload(() => {
    if (isQueueOpen) {
      setIsQueueOpen(false)
      pushLog({
        message: 'Очередь автоматически закрыта из-за перезагрузки страницы или закрытия вкладки приложения.',
        status: APP_LOG_STATUSES.WARNING,
        source: LOG_SOURCE.APPLICATION,
        actorUsername,
      })
    }
  })

  // Сценарий 2: Обработка смены активного Twitch-канала стримера
  useEffect(() => {
    if (isQueueOpen) {
      setIsQueueOpen(false)
      pushLog({
        message: 'Очередь автоматически закрыта в связи с переключением на канала.',
        status: APP_LOG_STATUSES.WARNING,
        source: LOG_SOURCE.APPLICATION,
        actorUsername,
      })
    }
    // eslint-disable-next-line
  }, [activeChannel])
}
