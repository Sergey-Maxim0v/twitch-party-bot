import { TWITCH_IRC_CAPABILITIES, TWITCH_IRC_CLIENT_LOG_MESSAGES, TWITCH_IRC_CLIENT_LOG_PREFIX } from '../../../constants/twitch.constants.ts'
import { isIrcCredentialsValid } from './isIrcCredentialsValid.ts'
import type { SocketSender } from '../types.ts'

interface SendInitialIrcCommandsProps {
  send: SocketSender;
  token: string;
  userLogin: string;
  channel: string;
}

/**
 * Отправляет стартовый пакет команд для авторизации и подключения к каналу Twitch IRC.
 *
 * @param send - Функция отправки данных в сокет.
 * @param token - OAuth-токен пользователя.
 * @param userLogin - Логин пользователя.
 * @param channel - Канал, к которому нужно подключиться.
 */
export const sendInitialIrcCommands = (
  {
    send,
    token,
    userLogin,
    channel,
  }: SendInitialIrcCommandsProps,
): void => {
  if (!isIrcCredentialsValid({ channel, token, userLogin })) {
    console.error(`${TWITCH_IRC_CLIENT_LOG_PREFIX} ${TWITCH_IRC_CLIENT_LOG_MESSAGES.INVALID_SESSION_PARAMS}`)
    return
  }

  const capabilities = [
    TWITCH_IRC_CAPABILITIES.MEMBERSHIP,
    TWITCH_IRC_CAPABILITIES.TAGS,
    TWITCH_IRC_CAPABILITIES.COMMANDS,
  ].join(' ')

  send(`PASS oauth:${token}`)
  send(`NICK ${userLogin.toLowerCase()}`)
  send(`CAP REQ :${capabilities}`)
  send(`JOIN #${channel.toLowerCase()}`)
}
