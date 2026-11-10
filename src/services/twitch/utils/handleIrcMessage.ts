import { handleIrcPingPong } from './handleIrcPingPong.ts'
import { parseIrcMessage } from './parseIrcMessage.ts'
import type { ParsedIrcMessage } from '../types.ts'

interface HandleIrcMessageProps {
  event: MessageEvent;
  socket: WebSocket;
  emitMessage: (message: ParsedIrcMessage) => void;
}

/**
 * Главный диспетчер входящих сообщений.
 * Маршрутизирует сырые данные по специализированным обработчикам.
 */
export const handleIrcMessage = ({ event, socket, emitMessage }: HandleIrcMessageProps): void => {
  const rawMessage = event.data as string

  const lines = rawMessage.split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine) continue

    const isPing = handleIrcPingPong({ rawMessage: trimmedLine, socket })
    if (isPing) continue

    const parsed = parseIrcMessage(trimmedLine)

    if (!parsed) {
      console.info(`[IRC Parser] Failed to parse message at ${new Date().toISOString()}:`, {
        rawLength: trimmedLine.length,
        text: trimmedLine,
      })
      continue
    }

    emitMessage(parsed)
  }
}
