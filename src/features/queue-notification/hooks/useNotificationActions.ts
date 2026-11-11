import { type RefObject, type Dispatch, type SetStateAction, useCallback } from 'react'
import type { QueueSettings } from '../../queue-settings/types.ts'
import type { TwitchNotificationState } from '../types.ts'

/** Все группы событий буфера. */
const NOTIFICATION_FIELDS = [
  'joined',
  'waiting',
  'deleted',
  'movedToActive',
  'movedToWaiting',
  'denied',
] as const satisfies readonly (keyof TwitchNotificationState)[]

/**
 * Удаляет никнейм из группы без учёта регистра.
 * Возвращает `null`, если совпадений не было, чтобы не создавать лишний `Set`.
 */
const removeUsername = (members: Set<string>, normalizedUsername: string): Set<string> | null => {
  let hasMatch = false
  const nextMembers = new Set<string>()

  members.forEach(nickname => {
    if (nickname.toLowerCase() === normalizedUsername) {
      hasMatch = true
      return
    }

    nextMembers.add(nickname)
  })

  return hasMatch ? nextMembers : null
}

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
  const hasPermission = useCallback(
    (permission: keyof QueueSettings['chatNotificationPermissions']): boolean =>
      permissionsRef.current.allowSending && permissionsRef.current[permission],
    [permissionsRef],
  )

  const appendUsername = useCallback(
    (field: keyof TwitchNotificationState, username: string): void => {
      const normalizedUsername = username.toLowerCase()

      setState(currentState => {
        const nextState: TwitchNotificationState = { ...currentState }

        // Новое событие перекрывает все предыдущие статусы игрока:
        // в итоговое сообщение попадает только его актуальное положение в очереди.
        NOTIFICATION_FIELDS.forEach(fieldName => {
          const filteredMembers = removeUsername(currentState[fieldName], normalizedUsername)

          if (filteredMembers) {
            nextState[fieldName] = filteredMembers
          }
        })

        const nextTargetMembers = new Set(nextState[field])
        nextTargetMembers.add(username)
        nextState[field] = nextTargetMembers

        return nextState
      })
    },
    [setState],
  )

  const addJoinedUser = useCallback((username: string): void => {
    if (!hasPermission('onMemberAdd')) {
      return
    }

    appendUsername('joined', username)
  }, [appendUsername, hasPermission])

  const addWaitingUser = useCallback((username: string): void => {
    if (!hasPermission('onMemberAdd')) {
      return
    }

    appendUsername('waiting', username)
  }, [appendUsername, hasPermission])

  const addDeletedUser = useCallback((username: string): void => {
    if (!hasPermission('onMemberRemove')) {
      return
    }

    appendUsername('deleted', username)
  }, [appendUsername, hasPermission])

  const addMovedToActiveUser = useCallback((username: string): void => {
    if (!hasPermission('onMemberMove')) {
      return
    }

    appendUsername('movedToActive', username)
  }, [appendUsername, hasPermission])

  const addMovedToWaitingUser = useCallback((username: string): void => {
    if (!hasPermission('onMemberMove')) {
      return
    }

    appendUsername('movedToWaiting', username)
  }, [appendUsername, hasPermission])

  const addDeniedUser = useCallback((username: string): void => {
    if (!hasPermission('onMemberAdd')) {
      return
    }

    appendUsername('denied', username)
  }, [appendUsername, hasPermission])

  return {
    addJoinedUser,
    addWaitingUser,
    addDeletedUser,
    addMovedToActiveUser,
    addMovedToWaitingUser,
    addDeniedUser,
  }
}
