import { TWITCH_IRC_CAPABILITIES } from '../../../constants/twitch.constants.ts'

interface SendInitialIrcCommandsProps {
  socket: WebSocket,
  token: string,
  userLogin: string,
  channel: string
}

/**
 * Отправляет стартовый пакет команд для авторизации и подключения к каналу Twitch IRC.
 * @param socket - Открытое WebSocket-соединение.
 * @param token - OAuth-токен пользователя.
 * @param userLogin - Логин пользователя.
 * @param channel - Канал, к которому нужно подключиться.
 */
export const sendInitialIrcCommands = (
  {
    socket,
    token,
    userLogin,
    channel,
  }: SendInitialIrcCommandsProps,
): void => {
  const lowerLogin = userLogin.toLowerCase()
  const lowerChannel = channel.toLowerCase()

  const capabilities = [
    TWITCH_IRC_CAPABILITIES.MEMBERSHIP,
    TWITCH_IRC_CAPABILITIES.TAGS,
    TWITCH_IRC_CAPABILITIES.COMMANDS,
  ].join(' ')

  socket.send(`PASS oauth:${token}`)
  socket.send(`NICK ${lowerLogin}`)
  socket.send(`CAP REQ :${capabilities}`)
  socket.send(`JOIN #${lowerChannel}`)
}
