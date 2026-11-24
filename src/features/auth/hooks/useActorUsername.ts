import { APP_LOG_FALLBACK_ACTOR } from '../../../constants/app-logs.constants.ts'
import { useAuth } from './useAuth.ts'

/**
 * Возвращает отображаемое имя текущего актора для журнала приложения.
 *
 * @param fallback - Имя, если ни профиль, ни сессия недоступны.
 */
export const useActorUsername = (fallback: string = APP_LOG_FALLBACK_ACTOR): string => {
  const { userDisplayName, session } = useAuth()

  return userDisplayName ?? session?.login ?? fallback
}
