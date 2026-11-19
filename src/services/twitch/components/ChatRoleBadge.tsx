import type { FC } from 'react'
import {
  CHAT_MESSAGE_STYLES,
  type ChatMessageRole,
} from '../../../constants/chat-message.constants.ts'

interface ChatRoleBadgeProps {
  /** Данные роли для отображения. */
  role: ChatMessageRole;
}

/**
 * Компактный бейдж роли в сообщении чата.
 */
export const ChatRoleBadge: FC<ChatRoleBadgeProps> = ({ role }) => {
  const Icon = role.icon

  return (
    <span className={`${CHAT_MESSAGE_STYLES.BADGE} ${role.badgeClassName}`} title={role.label}>
      <Icon className={CHAT_MESSAGE_STYLES.BADGE_ICON} />
      <span className={CHAT_MESSAGE_STYLES.SCREEN_READER_ONLY}>{role.label}</span>
    </span>
  )
}
