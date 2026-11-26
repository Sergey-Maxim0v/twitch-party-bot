import { formatMember } from './formatMember.ts'
import { formatNotificationPart } from './formatNotificationPart.ts'
import { formatPrefixedMessage } from './formatPrefixedMessage.ts'
import type { TwitchNotificationState } from '../types.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'
import {
  QUEUE_CHAT_MESSAGE_SEPARATOR,
  QUEUE_NOTIFICATION_PART_TITLES,
} from '../../../constants/queue.constants.ts'
import { fitChatMessage } from '../../../services/twitch/utils/fitChatMessage.ts'

interface FormatNotificationMessageArgs extends Pick<QueueSettings, 'marks'> {
  /** Буфер накопленных событий очереди. */
  state: TwitchNotificationState;
  /** Разрешения на отправку уведомлений по типам событий. */
  permissions: QueueSettings['chatNotificationPermissions'];
  /** Префикс автоматических сообщений. */
  prefix: QueueSettings['messagePrefix'];
}

/**
 * Форматирует пакет накопившихся изменений очереди в одну компактную строку.
 */
export const formatNotificationMessage = ({
  state,
  permissions,
  marks,
  prefix,
}: FormatNotificationMessageArgs): string => {
  const { joined, waiting, deleted, movedToActive, movedToWaiting, denied } = state
  const { onMemberAdd, onMemberRemove, onMemberMove } = permissions

  const groups = [
    {
      title: QUEUE_NOTIFICATION_PART_TITLES.JOINED,
      members: Array.from(joined).map(nick => formatMember({ mark: marks.active, nickname: nick })),
      enabled: onMemberAdd,
    },
    {
      title: QUEUE_NOTIFICATION_PART_TITLES.WAITING,
      members: Array.from(waiting).map(nick => formatMember({ mark: marks.waiting, nickname: nick })),
      enabled: onMemberAdd,
    },
    {
      title: QUEUE_NOTIFICATION_PART_TITLES.DELETED,
      members: Array.from(deleted).map(nick => formatMember({ mark: marks.removed, nickname: nick })),
      enabled: onMemberRemove,
    },
    {
      title: QUEUE_NOTIFICATION_PART_TITLES.MOVED_TO_ACTIVE,
      members: Array.from(movedToActive).map(nick => formatMember({ mark: marks.active, nickname: nick })),
      enabled: onMemberMove,
    },
    {
      title: QUEUE_NOTIFICATION_PART_TITLES.MOVED_TO_WAITING,
      members: Array.from(movedToWaiting).map(nick => formatMember({ mark: marks.waiting, nickname: nick })),
      enabled: onMemberMove,
    },
    {
      title: QUEUE_NOTIFICATION_PART_TITLES.DENIED,
      members: Array.from(denied).map(nick => formatMember({ mark: marks.removed, nickname: nick })),
      enabled: onMemberAdd,
    },
  ]

  if (!groups.some(group => group.enabled && group.members.length > 0)) {
    return ''
  }

  return fitChatMessage({
    build: visibleCounts => {
      const parts = groups
        .map((group, index) => group.enabled
          ? formatNotificationPart({ title: group.title, members: group.members, limit: visibleCounts[index] })
          : '')
        .filter(part => part.length > 0)

      if (parts.length === 0) return ''

      const body = parts.join(QUEUE_CHAT_MESSAGE_SEPARATOR)

      return formatPrefixedMessage(body, prefix)
    },
    counts: groups.map(group => group.enabled ? group.members.length : 0),
    minVisible: groups.map((_, index) => index === 0 ? 1 : 0),
  })
}
