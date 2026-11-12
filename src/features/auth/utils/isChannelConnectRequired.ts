interface IsChannelConnectRequiredProps {
  /** Канал, к которому бот подключён в текущей сессии. */
  currentChannel: string | null;
  /** Канал, к которому планируется подключение. */
  targetChannel: string;
  /** Текущее состояние сокета. */
  socketReadyState: WebSocket['readyState'] | null;
}

/**
 * Определяет, требуется ли подключение к целевому каналу.
 *
 * Повторный выбор уже подключённого канала не требует переподключения:
 * сокет остаётся живым, а протухшее соединение требует восстановления.
 *
 * @returns `true`, если нужно переподключиться.
 */
export const isChannelConnectRequired = ({
  currentChannel,
  targetChannel,
  socketReadyState,
}: IsChannelConnectRequiredProps): boolean => {
  const isSameChannel = currentChannel === targetChannel.trim().toLowerCase()
  const isSocketOpen = socketReadyState === WebSocket.OPEN

  return !isSameChannel || !isSocketOpen
}
