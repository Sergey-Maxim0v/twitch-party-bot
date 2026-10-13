import type { CSSProperties, FC } from 'react'
import { LuCircleAlert, LuGem, LuSparkles, LuSword, LuTwitch, LuWrench } from 'react-icons/lu'
import { TwitchIrcCommand } from '../config.ts'
import type { ParsedIrcMessage } from '../types.ts'
import { getAdaptedTwitchColors } from '../utils/getAdaptedTwitchColors.ts'

interface ChatMessageProps {
  msg: ParsedIrcMessage;
  useColoredNames: boolean;
  highlightRoles: boolean;
  isShowDeletedMessages: boolean;
  showSystemNotifications: boolean;
  highlightPointsMessages: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({
  msg,
  useColoredNames,
  highlightRoles,
  isShowDeletedMessages,
  showSystemNotifications,
  highlightPointsMessages,
}) => {
  if (msg.isDeleted && !isShowDeletedMessages) return null
  if (msg.isSystem && msg.isChannelEvent && !showSystemNotifications) return null

  let containerClassName = 'text-sm break-words leading-relaxed animate-fadeIn p-1 rounded transition-all block w-full'

  if (highlightRoles && !msg.isSystem) {
    if (msg.user.isBroadcaster) containerClassName += ' bg-error/10'
    else if (msg.user.isModerator) containerClassName += ' bg-success/10'
    else if (msg.user.isVip) containerClassName += ' bg-info/10'
  }

  if (msg.isHighlightedMessage && highlightPointsMessages && !msg.isSystem) {
    containerClassName += ' outline outline-2 outline-primary -outline-offset-2'
  }

  const deletedClassName = msg.isDeleted ? ' opacity-40 select-none' : ''
  const twitchColor = msg.user.color
  const hasColor = useColoredNames && twitchColor
  let nameStyle: CSSProperties | undefined = undefined
  let nameClassName = 'font-bold text-primary mr-2 break-words'

  if (hasColor) {
    const { lightColor, darkColor } = getAdaptedTwitchColors(twitchColor)
    nameStyle = { '--light-color': lightColor, '--dark-color': darkColor } as CSSProperties
    nameClassName = 'font-bold mr-2 break-words text-[var(--light-color)] [:where([data-theme=dim])_&]:text-[var(--dark-color)]'
  }

  const displaySenderName = msg.user.displayName || msg.user.nick

  if (msg.isSystem) {
    const isAlert = msg.command === TwitchIrcCommand.USER_NOTICE && !msg.isAnnouncement

    // Смешиваем системные цвета с черным для светлой темы, возвращая оригинал для data-theme="dim"
    let systemColorClass = 'text-[color-mix(in_oklch,var(--color-warning)_75%,black)] [:where([data-theme=dim])_&]:text-warning/80 font-medium italic'

    if (msg.isAnnouncement) {
      systemColorClass = 'text-[color-mix(in_oklch,var(--color-secondary)_80%,black)] [:where([data-theme=dim])_&]:text-secondary font-semibold'
    } else if (isAlert) {
      systemColorClass = 'text-[color-mix(in_oklch,var(--color-info)_80%,black)] [:where([data-theme=dim])_&]:text-info font-medium'
    }

    return (
      <div className={`${containerClassName} ${systemColorClass}`}>
        <span className="text-xs text-base-content/40 mr-2 select-none">{msg.timestamp}</span>
        <span className="mr-2">
          {isAlert || msg.isAnnouncement ?
            <LuSparkles className="w-4 h-4 inline align-middle" /> : <LuWrench className="w-4 h-4 inline align-middle" />
          }
        </span>
        {msg.isAnnouncement && <span className="mr-2">{displaySenderName}:</span>}
        <span>{msg.text}</span>
      </div>
    )
  }

  const iconClassName = 'w-4 h-4 inline align-middle mr-1'

  return (
    <div className={`${containerClassName} ${deletedClassName}`}>
      <span className="inline-block select-none mr-1.5 align-middle">
        <span className="text-xs text-base-content/40 mr-1.5">{msg.timestamp}</span>
        {msg.isDeleted && <LuCircleAlert className={iconClassName} />}
        {msg.user.isBroadcaster && <LuTwitch className={iconClassName} />}
        {msg.user.isModerator && <LuSword className={iconClassName} />}
        {msg.user.isVip && <LuGem className={iconClassName} />}
      </span>
      <span className={`${nameClassName} break-all inline align-middle`} style={nameStyle}>
        {displaySenderName}:
      </span>
      <span className={`${msg.isDeleted ? 'text-base-content/60' : 'text-base-content'} inline align-middle ml-1.5`}>
        {msg.text}
      </span>
    </div>
  )
}

export default ChatMessage
