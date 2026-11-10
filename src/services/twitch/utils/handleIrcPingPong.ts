import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'

interface HandleIrcPingProps {
  rawMessage: string;
  socket: WebSocket;
}

const TWITCH_PONG_MESSAGE = 'PONG :tmi.twitch.tv'

/**
 * Проверяет сообщение на PING от сервера Twitch и отправляет PONG для поддержания сессии.
 * @param rawMessage - Сырая строка IRC-сообщения.
 * @param socket - Открытое WebSocket-соединение.
 * @returns `true`, если сообщение было PING-запросом.
 */
export const handleIrcPingPong = ({ rawMessage, socket }: HandleIrcPingProps): boolean => {
  if (rawMessage.startsWith(TWITCH_IRC_COMMANDS.PING)) {
    socket.send(TWITCH_PONG_MESSAGE)
    return true
  }

  return false
}
