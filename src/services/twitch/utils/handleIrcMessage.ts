import { TWITCH_IRC_LINE_SEPARATOR_REGEX, TWITCH_IRC_PARSER_LOG_PREFIX } from '../../../constants/twitch.constants.ts'
import { handleIrcPingPong } from './handleIrcPingPong.ts'
import { parseIrcMessage } from './parseIrcMessage.ts'
import type { ParsedIrcMessage } from '../types.ts'

interface HandleIrcMessageProps {
  event: MessageEvent<unknown>;
  socket: WebSocket;
  emitMessage: (message: ParsedIrcMessage) => void;
}

/**
 * Разбирает входящие IRC-сообщения и передает распарсенные данные подписчикам.
 * Данные, отличные от строки, игнорируются.
 * @param event - Событие сообщения WebSocket.
 * @param socket - Открытое WebSocket-соединение.
 * @param emitMessage - Колбэк для передачи распарсенного сообщения.
 */
export const handleIrcMessage = ({ event, socket, emitMessage }: HandleIrcMessageProps): void => {
  const rawMessage = event.data

  if (typeof rawMessage !== 'string') {
    console.warn(`${TWITCH_IRC_PARSER_LOG_PREFIX} Ожидалась строка, получено: ${typeof rawMessage}`)
    return
  }

  for (const line of rawMessage.split(TWITCH_IRC_LINE_SEPARATOR_REGEX)) {
    const trimmedLine = line.trim()

    if (!trimmedLine) continue

    if (handleIrcPingPong({ rawMessage: trimmedLine, socket })) continue

    const parsed = parseIrcMessage(trimmedLine)

    if (!parsed) {
      console.info(`${TWITCH_IRC_PARSER_LOG_PREFIX} Не удалось разобрать сообщение:`, {
        rawLength: trimmedLine.length,
        text: trimmedLine,
      })
      continue
    }

    emitMessage(parsed)
  }
}
