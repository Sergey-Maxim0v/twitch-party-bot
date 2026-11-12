import { TWITCH_IRC_LINE_SEPARATOR_REGEX, TWITCH_IRC_PARSER_LOG_PREFIX } from '../../../constants/twitch.constants.ts'
import { handleIrcPingPong } from './handleIrcPingPong.ts'
import { parseIrcMessage } from './parseIrcMessage.ts'
import type { ParsedIrcMessage, SocketSender } from '../types.ts'

interface HandleIrcMessageProps {
  event: MessageEvent<unknown>;
  send: SocketSender;
  emitMessage: (message: ParsedIrcMessage) => void;
}

/**
 * Разбирает входящие IRC-сообщения и передает разобранные данные подписчикам.
 * Данные, отличные от строки, игнорируются.
 * @param event - Событие сообщения WebSocket.
 * @param send - Функция отправки данных в сокет.
 * @param emitMessage - Колбэк для передачи разобранного сообщения.
 */
export const handleIrcMessage = ({ event, send, emitMessage }: HandleIrcMessageProps): void => {
  const rawMessage = event.data

  if (typeof rawMessage !== 'string') {
    console.warn(`${TWITCH_IRC_PARSER_LOG_PREFIX} Ожидалась строка, получено: ${typeof rawMessage}`)
    return
  }

  for (const line of rawMessage.split(TWITCH_IRC_LINE_SEPARATOR_REGEX)) {
    const trimmedLine = line.trim()

    if (!trimmedLine) continue
    if (handleIrcPingPong({ rawMessage: trimmedLine, send })) continue

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
