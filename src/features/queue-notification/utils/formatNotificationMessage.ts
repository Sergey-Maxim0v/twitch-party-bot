import { formatNotificationPart } from './formatNotificationPart.ts'
import type { TwitchNotificationState } from '../types.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'

interface FormatNotificationMessageArgs {
  /** Буфер накопленных событий очереди. */
  state: TwitchNotificationState;
  /** Разрешения на отправку уведомлений по типам событий. */
  permissions: QueueSettings['chatNotificationPermissions'];
  /** Префикс автоматических сообщений. */
  prefix: QueueSettings['messagePrefix'];
}

/** Безопасный лимит длины текстового сообщения для Twitch PRIVMSG. */
const TWITCH_CHAT_MESSAGE_SAFE_MAX_LENGTH = 400

/**
 * Форматирует пакет накопившихся изменений очереди в одну компактную строку.
 */
export const formatNotificationMessage = ({
  state,
  permissions,
  prefix,
}: FormatNotificationMessageArgs): string => {
  const { joined, waiting, deleted, movedToActive, movedToWaiting, denied } = state
  const { onMemberAdd, onMemberRemove, onMemberMove } = permissions

  const hasChanges =
    joined.size > 0 ||
    waiting.size > 0 ||
    deleted.size > 0 ||
    movedToActive.size > 0 ||
    movedToWaiting.size > 0 ||
    denied.size > 0

  if (!hasChanges) {
    return ''
  }

  const joinedArray = Array.from(joined).map(nick => `🟢@${nick}`)
  const waitingArray = Array.from(waiting).map(nick => `🟡@${nick}`)
  const deletedArray = Array.from(deleted).map(nick => `🔴@${nick}`)
  const movedToActiveArray = Array.from(movedToActive).map(nick => `🟢@${nick}`)
  const movedToWaitingArray = Array.from(movedToWaiting).map(nick => `🟡@${nick}`)
  const deniedArray = Array.from(denied).map(nick => `🔴@${nick}`)

  let showJoinedCount = onMemberAdd ? joinedArray.length : 0
  let showWaitingCount = onMemberAdd ? waitingArray.length : 0
  let showDeletedCount = onMemberRemove ? deletedArray.length : 0
  let showMovedToActiveCount = onMemberMove ? movedToActiveArray.length : 0
  let showMovedToWaitingCount = onMemberMove ? movedToWaitingArray.length : 0
  let showDeniedCount = onMemberAdd ? deniedArray.length : 0

  const buildString = (): string => {
    const parts = [
      formatNotificationPart({ title: 'Добавлены', members: joinedArray, limit: showJoinedCount }),
      formatNotificationPart({ title: 'Добавлены в ожидающие', members: waitingArray, limit: showWaitingCount }),
      formatNotificationPart({ title: 'Удалены', members: deletedArray, limit: showDeletedCount }),
      formatNotificationPart({ title: 'Перемещены в очередь', members: movedToActiveArray, limit: showMovedToActiveCount }),
      formatNotificationPart({ title: 'Перемещены в ожидающие', members: movedToWaitingArray, limit: showMovedToWaitingCount }),
      formatNotificationPart({ title: 'Отказано', members: deniedArray, limit: showDeniedCount }),
    ].filter(part => part.length > 0)

    if (parts.length === 0) {
      return ''
    }

    const body = parts.join(' | ')

    return prefix ? `${prefix} ${body}` : body
  }

  let result = buildString()

  while (result.length > TWITCH_CHAT_MESSAGE_SAFE_MAX_LENGTH) {
    if (showDeniedCount > 0) {
      showDeniedCount--
    } else if (showMovedToWaitingCount > 0) {
      showMovedToWaitingCount--
    } else if (showMovedToActiveCount > 0) {
      showMovedToActiveCount--
    } else if (showDeletedCount > 0) {
      showDeletedCount--
    } else if (showWaitingCount > 0) {
      showWaitingCount--
    } else if (showJoinedCount > 1) {
      showJoinedCount--
    } else {
      break
    }

    result = buildString()
  }

  return result
}
