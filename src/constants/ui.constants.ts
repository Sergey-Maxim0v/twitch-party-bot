import type { ThemeMode } from '../hooks/types/theme.types.ts'
import type { ChatAccessStatus } from '../services/socket/types.ts'
import { LuMoon, LuSun, LuSunMoon } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { TWITCH_CHAT_ACCESS_STATUSES } from './socket.constants.ts'

export const THEME_MODE_ICONS: Record<ThemeMode, IconType> = {
  nord: LuSun,
  dim: LuMoon,
  system: LuSunMoon,
}

export const TWITCH_CHAT_STATUS_BUTTON_CLASSES: Record<ChatAccessStatus, string> = {
  [TWITCH_CHAT_ACCESS_STATUSES.CONNECTED]: 'btn-primary',
  [TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED]: 'btn-warning text-black',
  [TWITCH_CHAT_ACCESS_STATUSES.OFFLINE]: 'btn-error text-white',
  [TWITCH_CHAT_ACCESS_STATUSES.BANNED]: 'btn-neutral',
}
