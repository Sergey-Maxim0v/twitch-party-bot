import { QUEUE_LIST_SEPARATOR, QUEUE_SESSION_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import { fitChatMessage } from '../../../services/twitch/utils/fitChatMessage.ts'
import { formatHiddenMembersCount } from './formatHiddenMembersCount.ts'
import { formatMember } from './formatMember.ts'
import { formatPrefixedMessage } from './formatPrefixedMessage.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'

interface FormatFinishedQueueMessageArgs extends Pick<QueueSettings, 'marks'> {
  /** Ники игроков без символа `@`. */
  nicknames: string[];
  /** Префикс автоматических сообщений. */
  prefix?: string;
}

/**
 * Формирует сообщение о завершении сессии со списком игроков.
 */
export const formatFinishedQueueMessage = ({ nicknames, marks, prefix }: FormatFinishedQueueMessageArgs): string => {
  const head = formatPrefixedMessage(QUEUE_SESSION_LOG_MESSAGES.FINISHED_CHAT_HEADER, prefix)

  if (nicknames.length === 0) return head

  return fitChatMessage({
    build: ([visible]) => {
      if (visible === 0) return `${head}${formatHiddenMembersCount(nicknames.length)}`

      const hidden = nicknames.length - visible
      const formattedNicknames = nicknames
        .slice(0, visible)
        .map(nickname => formatMember({ mark: marks.active, nickname }))
        .join(QUEUE_LIST_SEPARATOR)

      return `${head} ${formattedNicknames}${formatHiddenMembersCount(hidden)}`
    },
    counts: [nicknames.length],
    minVisible: [0],
  })
}
