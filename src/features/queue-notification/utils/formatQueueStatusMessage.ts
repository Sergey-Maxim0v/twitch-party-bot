import {
  QUEUE_CHAT_MEMBER_MARKS,
  QUEUE_CHAT_MESSAGE_SEPARATOR,
  QUEUE_LIST_SEPARATOR,
  QUEUE_STATUS_MESSAGE_LABELS,
} from '../../../constants/queue.constants.ts'
import { fitChatMessage } from '../../../services/twitch/utils/fitChatMessage.ts'
import { formatHiddenMembersCount } from './formatHiddenMembersCount.ts'
import { formatPrefixedMessage } from './formatPrefixedMessage.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { isUnlimitedQueueSize } from '../../queue/utils/isUnlimitedQueueSize.ts'

export interface FormatQueueStatusMessageArgs extends Pick<QueueSettings, 'maxQueueSize'> {
  /** Ники активной очереди. */
  activeUsernames: string[];
  /** Ники ожидающей очереди. */
  waitingUsernames: string[];
  /** Префикс автоматических сообщений. */
  prefix?: string;
  /** Заголовок перед составом очереди. */
  header?: string;
  /** Разделитель между заголовком и составом. */
  separator?: string;
}

/**
 * Формирует сообщение о составе очереди, скрывая участников при нехватке места.
 */
export const formatQueueStatusMessage = ({
  activeUsernames,
  waitingUsernames,
  maxQueueSize,
  prefix = '',
  header = '',
  separator = ' ',
}: FormatQueueStatusMessageArgs): string => {
  const activeMembers = activeUsernames.map(nick => `${QUEUE_CHAT_MEMBER_MARKS.ACTIVE}${nick}`)
  const waitingMembers = waitingUsernames.map(nick => `${QUEUE_CHAT_MEMBER_MARKS.WAITING}${nick}`)
  const head = header ? formatPrefixedMessage(header, prefix) : prefix
  const headWithSeparator = head ? `${head}${separator}` : ''
  let counter = `(${activeMembers.length}/${maxQueueSize})`
  if (isUnlimitedQueueSize(maxQueueSize)) {
    counter = `(${activeMembers.length})`
  }

  return fitChatMessage({
    build: ([visibleActive, visibleWaiting]) => {
      const parts: string[] = []

      if (visibleActive > 0) {
        const hidden = activeMembers.length - visibleActive
        parts.push(`${QUEUE_STATUS_MESSAGE_LABELS.ACTIVE} ${activeMembers.slice(0, visibleActive).join(QUEUE_LIST_SEPARATOR)}${formatHiddenMembersCount(hidden)}`)
      }

      if (visibleWaiting > 0) {
        const hidden = waitingMembers.length - visibleWaiting
        parts.push(`${QUEUE_STATUS_MESSAGE_LABELS.WAITING} ${waitingMembers.slice(0, visibleWaiting).join(QUEUE_LIST_SEPARATOR)}${formatHiddenMembersCount(hidden)}`)
      } else if (waitingMembers.length > 0 && visibleActive === activeMembers.length) {
        parts.push(`${QUEUE_STATUS_MESSAGE_LABELS.WAITING}${formatHiddenMembersCount(waitingMembers.length)}`)
      }

      let core = `${counter} ${QUEUE_STATUS_MESSAGE_LABELS.EMPTY}`
      if (parts.length > 0) {
        core = `${counter} ${parts.join(QUEUE_CHAT_MESSAGE_SEPARATOR)}`
      }

      return `${headWithSeparator}${core}`
    },
    counts: [activeMembers.length, waitingMembers.length],
    minVisible: [1, 0],
  })
}
