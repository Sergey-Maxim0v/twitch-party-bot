import { QUEUE_SESSION_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import { fitChatMessage } from '../../../services/twitch/utils/fitChatMessage.ts'
import { formatPrefixedMessage } from './formatPrefixedMessage.ts'

interface FormatFinishedQueueMessageArgs {
  /** Ники завершивших сессию игроков. */
  nicknames: string[]
  /** Префикс автоматических сообщений. */
  prefix?: string
}

/**
 * Формирует сообщение о завершении сессии со списком игроков.
 */
export const formatFinishedQueueMessage = ({ nicknames, prefix }: FormatFinishedQueueMessageArgs): string => {
  const head = formatPrefixedMessage(QUEUE_SESSION_LOG_MESSAGES.FINISHED_CHAT_HEADER, prefix)

  if (nicknames.length === 0) return head

  return fitChatMessage({
    build: ([visible]) => {
      if (visible === 0) return `${head} +${nicknames.length}`

      const hidden = nicknames.length - visible

      return `${head} ${nicknames.slice(0, visible).join(', ')}${hidden > 0 ? ` +${hidden}` : ''}`
    },
    counts: [nicknames.length],
    minVisible: [0],
  })
}
