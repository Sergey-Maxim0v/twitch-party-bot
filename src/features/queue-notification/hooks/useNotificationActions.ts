import { type RefObject, type Dispatch, type SetStateAction, useCallback } from 'react'
import type { QueueSettings } from '../../queue-settings/types.ts'
import type { TwitchNotificationState } from '../types.ts'

interface UseNotificationActionsArgs {
  /** Актуальная ссылка на конфигурацию разрешений автоматических уведомлений. */
  permissionsRef: RefObject<QueueSettings['chatNotificationPermissions']>;
  /** Функция обновления состояния буфера отправки уведомлений. */
  setState: Dispatch<SetStateAction<TwitchNotificationState>>;
}

interface UseNotificationActionsReturn {
  /** Добавляет пользователя в список успешно присоединившихся к активной очереди. */
  addJoinedUser: (username: string) => void;
  /** Добавляет пользователя в список ожидающих участников. */
  addWaitingUser: (username: string) => void;
  /** Добавляет пользователя в список удаленных из очереди. */
  addDeletedUser: (username: string) => void;
  /** Добавляет пользователя в список перемещенных в активный состав. */
  addMovedToActiveUser: (username: string) => void;
  /** Добавляет пользователя в список перемещенных в список ожидания. */
  addMovedToWaitingUser: (username: string) => void;
  /** Добавляет пользователя в список отклоненных при попытке входа. */
  addDeniedUser: (username: string) => void;
}

/**
 * Хук для генерации коллбэков изменения состояния буфера автоматических уведомлений.
 */
export const useNotificationActions = ({
  permissionsRef,
  setState,
}: UseNotificationActionsArgs): UseNotificationActionsReturn => {
  const addJoinedUser = useCallback((username: string): void => {
    if (!permissionsRef.current.allowSending || !permissionsRef.current.onMemberAdd) return

    setState(currentState => {
      if (currentState.joined.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.joined)
      nextSet.add(username)
      return { ...currentState, joined: nextSet }
    })
  }, [permissionsRef, setState])

  const addWaitingUser = useCallback((username: string): void => {
    if (!permissionsRef.current.allowSending || !permissionsRef.current.onMemberAdd) return

    setState(currentState => {
      if (currentState.waiting.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.waiting)
      nextSet.add(username)
      return { ...currentState, waiting: nextSet }
    })
  }, [permissionsRef, setState])

  const addDeletedUser = useCallback((username: string): void => {
    if (!permissionsRef.current.allowSending || !permissionsRef.current.onMemberRemove) return

    setState(currentState => {
      if (currentState.deleted.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.deleted)
      nextSet.add(username)
      return { ...currentState, deleted: nextSet }
    })
  }, [permissionsRef, setState])

  const addMovedToActiveUser = useCallback((username: string): void => {
    if (!permissionsRef.current.allowSending || !permissionsRef.current.onMemberMove) return

    setState(currentState => {
      if (currentState.movedToActive.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.movedToActive)
      nextSet.add(username)
      return { ...currentState, movedToActive: nextSet }
    })
  }, [permissionsRef, setState])

  const addMovedToWaitingUser = useCallback((username: string): void => {
    if (!permissionsRef.current.allowSending || !permissionsRef.current.onMemberMove) return

    setState(currentState => {
      if (currentState.movedToWaiting.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.movedToWaiting)
      nextSet.add(username)
      return { ...currentState, movedToWaiting: nextSet }
    })
  }, [permissionsRef, setState])

  const addDeniedUser = useCallback((username: string): void => {
    if (!permissionsRef.current.allowSending || !permissionsRef.current.onMemberAdd) return

    setState(currentState => {
      if (currentState.denied.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.denied)
      nextSet.add(username)
      return { ...currentState, denied: nextSet }
    })
  }, [permissionsRef, setState])
  return { addJoinedUser, addDeletedUser, addDeniedUser, addMovedToActiveUser, addMovedToWaitingUser, addWaitingUser }
}
