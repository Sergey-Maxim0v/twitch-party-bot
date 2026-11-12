import { createContext } from 'react'
import type { ChannelRestriction, ChannelRoles } from '../types'

/**
 * Интерфейс контекста информации о текущем канале чата.
 */
export interface ChannelInfoContextType {
  /** Логин подключённого канала. */
  channel: string | null;

  /** Роли аккаунта бота в канале. */
  roles: ChannelRoles;

  /** Активные ограничения доступа к чату. */
  restrictions: ChannelRestriction[];

  /** Признак того, что сведения о ролях уже получены от Twitch. */
  hasRolesData: boolean;

  /** Признак активного соединения с чатом канала. */
  isConnected: boolean;
}

/**
 * Контекст для предоставления доступа к сведениям о текущем канале.
 */
export const ChannelInfoContext = createContext<ChannelInfoContextType | null>(null)
