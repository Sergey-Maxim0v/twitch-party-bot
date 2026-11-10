import { type Dispatch, type SetStateAction, useEffect } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useOnWindowUnload } from '../../../hooks/useOnWindowUnload.ts'
import { APP_LOG_STATUSES, type AppLogStatus, APP_LOG_SOURCES, type LogSource } from '../../app-logs/types.ts'

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
interface UseAutocloseQueueProps {
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

  const actorUsername = userDisplayName ?? session?.login ?? 'Application'

  // Закрытие при выгрузке вкладки, закрытии браузера или перезагрузке страницы.
  useOnWindowUnload(() => {
    if (!isQueueOpen) return

    setIsQueueOpen(false)
    pushLog({
      message: 'Очередь автоматически закрыта из-за перезагрузки страницы или закрытия вкладки приложения.',
      status: APP_LOG_STATUSES.WARNING,
      source: APP_LOG_SOURCES.APPLICATION,
      actorUsername,
    })
  })

  // Закрытие при смене активного Twitch-канала стримера.
  useEffect(() => {
    if (!isQueueOpen) return

    setIsQueueOpen(false)
    pushLog({
      message: 'Очередь автоматически закрыта в связи с переключением на канала.',
      status: APP_LOG_STATUSES.WARNING,
      source: APP_LOG_SOURCES.APPLICATION,
      actorUsername,
    })
    // eslint-disable-next-line
  }, [activeChannel])
}
