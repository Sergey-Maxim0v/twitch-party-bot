import { useCallback, useMemo, useState } from 'react'
import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { SOCKET_CONNECTION_STATUSES } from '../../../services/socket/types.ts'
import { useTwitchSubscription } from '../../../services/twitch/hooks/useTwitchSubscription.ts'
import { isRoomStateInitialization } from '../../../services/twitch/utils/roomState.ts'
import type { ParsedIrcMessage } from '../../../services/twitch/types.ts'
import { areChannelRolesEqual, EMPTY_CHANNEL_ROLES, parseChannelRoles } from '../utils/parseChannelRoles.ts'
import { isOwnAccountMessage } from '../utils/isOwnAccountMessage.ts'
import { parseChannelRestrictions } from '../utils/parseChannelRestrictions.ts'
import type { ChannelRestriction, ChannelRoles } from '../types'

interface ChannelInfoState {
  /** Канал, к которому относятся накопленные сведения. */
  channel: string | null;

  /** Накопленные теги состояния комнаты. */
  roomTags: Record<string, string>;

  /** Роли аккаунта в канале. */
  roles: ChannelRoles;

  /** Активные ограничения доступа к чату. */
  restrictions: ChannelRestriction[];

  /** Признак того, что сведения о ролях уже получены от Twitch. */
  hasRolesData: boolean;
}

/**
 * Создаёт пустое состояние сведений о канале.
 *
 * @returns Начальное состояние без ролей и ограничений.
 */
const createInitialChannelInfo = (): ChannelInfoState => ({
  channel: null,
  roomTags: {},
  roles: EMPTY_CHANNEL_ROLES,
  restrictions: [],
  hasRolesData: false,
})

/**
 * Хук сбора сведений о текущем канале: роли аккаунта и ограничения чата.
 * Роли приходят в USERSTATE и собственных сообщениях, ограничения — в ROOMSTATE.
 */
export const useChannelInfoManager = () => {
  const { activeChannel, session } = useAuth()
  const { connectionStatus } = useSocketContext()

  const [state, setState] = useState<ChannelInfoState>(createInitialChannelInfo)

  const channel = activeChannel
  const userLogin = session?.login
  const isConnected = connectionStatus === SOCKET_CONNECTION_STATUSES.CONNECTED

  /**
   * Обновляет сведения о канале из входящего IRC-сообщения.
   *
   * @param message - Входящее IRC-сообщение.
   */
  const handleIncomingMessage = useCallback((message: ParsedIrcMessage): void => {
    if (message.command === TWITCH_IRC_COMMANDS.ROOM_STATE) {
      const tags = message.tags || {}

      setState(prevState => {
        const prevRoomTags = prevState.channel === channel ? prevState.roomTags : {}

        const roomTags = isRoomStateInitialization(tags)
          ? { ...tags }
          : { ...prevRoomTags, ...tags }

        return {
          ...prevState,
          channel,
          roomTags,
          restrictions: parseChannelRestrictions(roomTags),
        }
      })
      return
    }

    if (!isOwnAccountMessage(message, userLogin)) return

    const nextRoles = parseChannelRoles(message.tags)

    setState(prevState => {
      const isUnchanged = prevState.channel === channel
        && prevState.hasRolesData
        && areChannelRolesEqual(prevState.roles, nextRoles)

      if (isUnchanged) return prevState

      return { ...prevState, channel, roles: nextRoles, hasRolesData: true }
    })
  }, [channel, userLogin])

  useTwitchSubscription(handleIncomingMessage)

  const isCurrentChannel = state.channel === channel

  const isOwnChannel = channel !== null && userLogin !== undefined
    && channel.toLowerCase() === userLogin.toLowerCase()

  const roles = useMemo(() => {
    const currentRoles = isCurrentChannel ? state.roles : EMPTY_CHANNEL_ROLES

    if (!isOwnChannel) return currentRoles

    return { ...currentRoles, isBroadcaster: true, isModerator: true }
  }, [isCurrentChannel, isOwnChannel, state.roles])

  const hasRolesData = (isCurrentChannel && state.hasRolesData) || isOwnChannel

  return useMemo(() => ({
    channel,
    hasRolesData,
    isConnected,
    restrictions: isCurrentChannel ? state.restrictions : [],
    roles,
  }), [channel, hasRolesData, isConnected, roles, state.restrictions, isCurrentChannel])
}
