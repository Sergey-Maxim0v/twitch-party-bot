import {
  TWITCH_IRC_LINE_SEPARATOR_REGEX,
  TWITCH_IRC_PARSER_LOG_MESSAGES,
  TWITCH_IRC_PARSER_LOG_PREFIX,
} from '../../../constants/twitch.constants.ts'
import { handleIrcPingPong } from './handleIrcPingPong.ts'
import { parseIrcMessage } from './parseIrcMessage.ts'
import type { ParsedIrcMessage, SocketSender } from '../types.ts'

interface HandleIrcMessageProps {
  event: MessageEvent<unknown>;
  send: SocketSender;
  emitMessage: (message: ParsedIrcMessage) => void;
}

interface HandleIrcLineProps {
  line: string;
  send: SocketSender;
  emitMessage: (message: ParsedIrcMessage) => void;
}

/**
 * Разбирает одну строку IRC и передает разобранные данные подписчикам.
 * Пустые строки и PING подписчикам не передаются.
 * @param line - Строка без разделителей.
 * @param send - Функция отправки данных в сокет.
 * @param emitMessage - Колбэк для передачи разобранного сообщения.
 */
const handleIrcLine = ({ line, send, emitMessage }: HandleIrcLineProps): void => {
  const trimmedLine = line.trim()

  if (!trimmedLine) return
  if (handleIrcPingPong({ rawMessage: trimmedLine, send })) return

  const parsed = parseIrcMessage(trimmedLine)

  if (!parsed) {
    console.info(`${TWITCH_IRC_PARSER_LOG_PREFIX} ${TWITCH_IRC_PARSER_LOG_MESSAGES.PARSE_FAILED}`, {
      rawLength: trimmedLine.length,
      text: trimmedLine,
    })
    return
  }

  emitMessage(parsed)
}

/**
 * Разделяет входящие данные сокета на строки (CRLF, CR или LF) и передает их на разбор.
 * Данные, отличные от строки, игнорируются.
 * @param event - Событие сообщения WebSocket.
 * @param send - Функция отправки данных в сокет.
 * @param emitMessage - Колбэк для передачи разобранного сообщения.
 */
export const handleIrcMessage = ({ event, send, emitMessage }: HandleIrcMessageProps): void => {
  const rawMessage = event.data

  if (typeof rawMessage !== 'string') {
    console.warn(`${TWITCH_IRC_PARSER_LOG_PREFIX} ${TWITCH_IRC_PARSER_LOG_MESSAGES.UNEXPECTED_DATA_TYPE(typeof rawMessage)}`)
    return
  }

  for (const line of rawMessage.split(TWITCH_IRC_LINE_SEPARATOR_REGEX)) {
    handleIrcLine({ emitMessage, line, send })
  }
}
