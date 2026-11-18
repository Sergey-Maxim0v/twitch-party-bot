import type { CSSProperties, FC } from 'react'
import { LuCircleAlert, LuGem, LuSparkles, LuSword, LuTwitch, LuWrench } from 'react-icons/lu'
import { ChatMessageText } from './ChatMessageText.tsx'
import { TWITCH_IRC_COMMANDS, TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage, TwitchEmoteDictionary } from '../types.ts'
import { getAdaptedTwitchColors } from '../utils/getAdaptedTwitchColors.ts'

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
 * Отображает одно сообщение чата Twitch с учетом ролей, эмоций, модерации и настроек.
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

  let containerClassName = 'text-sm break-words leading-relaxed animate-fadeIn p-1 rounded transition-all block w-full'

  const shouldHighlightRoles = highlightRoles && !msg.isSystem

  if (shouldHighlightRoles && msg.user.isBroadcaster) containerClassName += ' bg-error/10'
  else if (shouldHighlightRoles && msg.user.isModerator) containerClassName += ' bg-success/10'
  else if (shouldHighlightRoles && msg.user.isVip) containerClassName += ' bg-info/10'

  if (msg.isHighlightedMessage && highlightPointsMessages && !msg.isSystem) {
    containerClassName += ' outline outline-2 outline-primary -outline-offset-2'
  }

  const deletedClassName = msg.isDeleted ? ' opacity-40 select-none' : ''
  const iconBaseClassName = 'w-4 h-4 inline align-middle'
  const iconClassName = `${iconBaseClassName} mr-1`
  const adaptedColors = useColoredNames ? getAdaptedTwitchColors(msg.user.color ?? '') : null
  let nameStyle: CSSProperties | undefined = undefined
  let nameClassName = 'font-bold text-primary mr-2 break-words'

  if (adaptedColors) {
    nameStyle = { '--light-color': adaptedColors.lightColor, '--dark-color': adaptedColors.darkColor } as CSSProperties
    nameClassName = 'font-bold mr-2 break-words text-[var(--light-color)] [:where([data-theme=dim])_&]:text-[var(--dark-color)]'
  }

  const displaySenderName = msg.user.displayName || msg.user.nick

  if (msg.isSystem) {
    const isAlert = msg.command === TWITCH_IRC_COMMANDS.USER_NOTICE && !msg.isAnnouncement

    let systemColorClass = 'text-[color-mix(in_oklch,var(--color-warning)_75%,black)] [:where([data-theme=dim])_&]:text-warning/80 font-medium italic'

    if (msg.isAnnouncement) {
      systemColorClass = 'text-[color-mix(in_oklch,var(--color-secondary)_80%,black)] [:where([data-theme=dim])_&]:text-secondary font-semibold'
    } else if (isAlert) {
      systemColorClass = 'text-[color-mix(in_oklch,var(--color-info)_80%,black)] [:where([data-theme=dim])_&]:text-info font-medium'
    }

    return (
      <div className={`${containerClassName} ${systemColorClass} ${deletedClassName}`}>
        <span className="text-xs text-base-content/40 mr-2 select-none">{msg.timestamp}</span>
        <span className="mr-2">
          {msg.isDeleted && <LuCircleAlert className={iconClassName} />}
          {isAlert || msg.isAnnouncement ?
            <LuSparkles className={iconBaseClassName} /> : <LuWrench className={iconBaseClassName} />
          }
        </span>
        {msg.isAnnouncement && <span className="mr-2">{displaySenderName}:</span>}
        <span>{msg.text}</span>
      </div>
    )
  }

  const emoteTag = msg.tags[TWITCH_IRC_TAGS.EMOTES]

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
        <ChatMessageText emoteDictionary={emoteDictionary} emoteTag={emoteTag} showEmotes={showEmotes} text={msg.text} />
      </span>
    </div>
  )
}
