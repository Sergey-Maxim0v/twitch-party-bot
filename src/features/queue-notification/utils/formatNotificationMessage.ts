import { formatNotificationPart } from './formatNotificationPart.ts'
import type { TwitchNotificationState } from '../types.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'

export interface FormatNotificationMessageArgs {
  state: TwitchNotificationState;
  permissions: QueueSettings['chatNotificationPermissions'];
  prefix: QueueSettings['messagePrefix']
}

/** Безопасный лимит длины текстового сообщения для Twitch PRIVMSG. */
const TWITCH_MAX_LENGTH = 400

/**
 * Форматирует пакет накопившихся изменений очереди в одну компактную строку
 */
export const formatNotificationMessage = ({
  state,
  permissions,
  prefix,
}: FormatNotificationMessageArgs): string => {
  const { joined, waiting, deleted, movedToActive, movedToWaiting, denied } = state
  const { onMemberAdd, onMemberRemove, onMemberMove } = permissions

  if (
    joined.size === 0 &&
      waiting.size === 0 &&
      deleted.size === 0 &&
      movedToActive.size === 0 &&
      movedToWaiting.size === 0 &&
      denied.size === 0
  ) {
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

  /** Вспомогательная функция сборки строки на основе текущих счетчиков лимитов */
  const buildString = (): string => {
    const parts: string[] = []

    const joinedPart = formatNotificationPart({ title: 'Добавлены', members: joinedArray, limit: showJoinedCount })
    if (joinedPart) parts.push(joinedPart)

    const waitingPart = formatNotificationPart({ title: 'Добавлены в ожидающие', members: waitingArray, limit: showWaitingCount })
    if (waitingPart) parts.push(waitingPart)

    const deletedPart = formatNotificationPart({ title: 'Удалены', members: deletedArray, limit: showDeletedCount })
    if (deletedPart) parts.push(deletedPart)

    const movedToActivePart = formatNotificationPart({ title: 'Перемещены в очередь', members: movedToActiveArray, limit: showMovedToActiveCount })
    if (movedToActivePart) parts.push(movedToActivePart)

    const movedToWaitingPart = formatNotificationPart({ title: 'Перемещены в ожидающие', members: movedToWaitingArray, limit: showMovedToWaitingCount })
    if (movedToWaitingPart) parts.push(movedToWaitingPart)

    const deniedPart = formatNotificationPart({ title: 'Отказано', members: deniedArray, limit: showDeniedCount })
    if (deniedPart) parts.push(deniedPart)

    if (parts.length === 0) return ''

    return prefix ? `${prefix} ${parts.join(' | ')}` : parts.join(' | ')
  }

  let result = buildString()

  // Если строка превышает лимит, плавно убираем по одному никнейму с учетом приоритетов (снизу вверх)
  while (result.length > TWITCH_MAX_LENGTH) {
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
