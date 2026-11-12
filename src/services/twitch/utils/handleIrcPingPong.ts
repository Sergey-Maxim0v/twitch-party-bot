import { TWITCH_IRC_COMMANDS, TWITCH_PONG_MESSAGE } from '../../../constants/twitch.constants.ts'
import type { SocketSender } from '../types.ts'

interface HandleIrcPingProps {
  rawMessage: string;
  send: SocketSender;
}

/**
 * Проверяет сообщение на PING от сервера Twitch и отправляет PONG для поддержания сессии.
 * @param rawMessage - Сырая строка IRC-сообщения.
 * @param send - Функция отправки данных в сокет.
 * @returns `true`, если сообщение было PING-запросом.
 */
export const handleIrcPingPong = ({ rawMessage, send }: HandleIrcPingProps): boolean => {
  if (!rawMessage.startsWith(TWITCH_IRC_COMMANDS.PING)) return false

  send(TWITCH_PONG_MESSAGE)

  return true
}
