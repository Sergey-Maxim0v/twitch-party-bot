import type { CSSProperties, FC } from 'react'
import { LuCircleAlert, LuSparkles, LuWrench } from 'react-icons/lu'
import {
  CHAT_MESSAGE_ROLES,
  CHAT_MESSAGE_STYLES,
  CHAT_MESSAGE_SYSTEM_KINDS,
  CHAT_MESSAGE_SYSTEM_STYLES,
} from '../../../constants/chat-message.constants.ts'
import { TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage, TwitchEmoteDictionary } from '../types.ts'
import { getAdaptedTwitchColors } from '../utils/getAdaptedTwitchColors.ts'
import { getChatMessageSystemKind } from '../utils/getChatMessageSystemKind.ts'
import { ChatMessageText } from './ChatMessageText.tsx'
import { ChatRoleBadge } from './ChatRoleBadge.tsx'

interface ChatMessageProps {
  msg: ParsedIrcMessage;
  useColoredNames: boolean;
  highlightRoles: boolean;
  isShowDeletedMessages: boolean;
  showSystemNotifications: boolean;
  highlightPointsMessages: boolean;
  showEmotes: boolean;
  emoteDictionary: TwitchEmoteDictionary;
}

/**
 * Сообщение чата Twitch: системное событие или реплика зрителя с ролями и эмоциями.
 */
export const ChatMessage: FC<ChatMessageProps> = ({
  msg,
  useColoredNames,
  highlightRoles,
  isShowDeletedMessages,
  showSystemNotifications,
  highlightPointsMessages,
  showEmotes,
  emoteDictionary,
}) => {
  if (msg.isDeleted && !isShowDeletedMessages) return null
  if (msg.isSystem && msg.isChannelEvent && !showSystemNotifications) return null

  const role = highlightRoles && !msg.isSystem
    ? CHAT_MESSAGE_ROLES.find(item => msg.user[item.key])
    : undefined
  const isHighlighted = msg.isHighlightedMessage && highlightPointsMessages && !msg.isSystem
  const containerClassName = [
    CHAT_MESSAGE_STYLES.BASE,
    msg.isSystem ? CHAT_MESSAGE_STYLES.SYSTEM : CHAT_MESSAGE_STYLES.USER,
    role?.messageClassName,
    isHighlighted ? CHAT_MESSAGE_STYLES.HIGHLIGHT : '',
    msg.isDeleted ? CHAT_MESSAGE_STYLES.DELETED : '',
  ].filter(Boolean).join(' ')

  const adaptedColors = useColoredNames ? getAdaptedTwitchColors(msg.user.color ?? '') : null
  const nameStyle: CSSProperties | undefined = adaptedColors
    ? { '--dark-color': adaptedColors.darkColor, '--light-color': adaptedColors.lightColor } as CSSProperties
    : undefined
  const nameClassName = adaptedColors ? CHAT_MESSAGE_STYLES.COLORED_NAME : CHAT_MESSAGE_STYLES.NAME
  const textClassName = msg.isDeleted ? CHAT_MESSAGE_STYLES.DELETED_TEXT : CHAT_MESSAGE_STYLES.TEXT
  const displaySenderName = msg.user.displayName || msg.user.nick

  if (msg.isSystem) {
    const systemKind = getChatMessageSystemKind(msg)
    const SystemIcon = systemKind === CHAT_MESSAGE_SYSTEM_KINDS.DEFAULT ? LuWrench : LuSparkles

    return (
      <div className={`${containerClassName} ${CHAT_MESSAGE_SYSTEM_STYLES[systemKind]}`}>
        <span className={CHAT_MESSAGE_STYLES.META}>
          <span className={CHAT_MESSAGE_STYLES.TIMESTAMP}>{msg.timestamp}</span>
          {msg.isDeleted && <LuCircleAlert className={CHAT_MESSAGE_STYLES.DELETED_ICON} />}
          <SystemIcon className={CHAT_MESSAGE_STYLES.ICON} />
        </span>
        {msg.isAnnouncement && <span className={CHAT_MESSAGE_STYLES.SENDER}>{displaySenderName}:</span>}
        <span>{msg.text}</span>
      </div>
    )
  }

  const emoteTag = msg.tags[TWITCH_IRC_TAGS.EMOTES]

  return (
    <div className={containerClassName}>
      <span className={CHAT_MESSAGE_STYLES.META}>
        <span className={CHAT_MESSAGE_STYLES.TIMESTAMP}>{msg.timestamp}</span>
        {msg.isDeleted && <LuCircleAlert className={CHAT_MESSAGE_STYLES.DELETED_ICON} />}
        {CHAT_MESSAGE_ROLES.filter(item => msg.user[item.key]).map(item => (
          <ChatRoleBadge key={item.key} role={item} />
        ))}
      </span>
      <span className={nameClassName} style={nameStyle}>
        {displaySenderName}:
      </span>
      <span className={textClassName}>
        <ChatMessageText
          emoteDictionary={emoteDictionary}
          emoteTag={emoteTag}
          showEmotes={showEmotes}
          text={msg.text}
        />
      </span>
    </div>
  )
}
