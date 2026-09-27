import type { FC } from 'react'
import { LuCircleAlert, LuGem, LuSparkles, LuSword, LuTwitch, LuWrench } from 'react-icons/lu'
import { TwitchIrcCommand } from '../config.ts'
import type { ParsedIrcMessage } from '../types.ts'

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

  // Скрытие удаленных сообщений
  if (msg.isDeleted && !isShowDeletedMessages) {
    return null
  }

  // Скрытие системных уведомлений канала (подписки, рейды, режимы, баны)
  if (msg.isSystem && msg.isChannelEvent && !showSystemNotifications) {
    return null
  }

  let containerClassName = 'text-sm break-words leading-relaxed animate-fadeIn p-1 rounded transition-all block w-full'

  // Применяем фоновые цвета ролей
  if (highlightRoles && !msg.isSystem) {
    if (msg.user.isBroadcaster) containerClassName += ' bg-error/10'
    else if (msg.user.isModerator) containerClassName += ' bg-success/10'
    else if (msg.user.isVip) containerClassName += ' bg-info/10'
  }

  // Если сообщение выделено за баллы
  if (msg.isHighlightedMessage && highlightPointsMessages && !msg.isSystem) {
    containerClassName += ' outline outline-2 outline-primary -outline-offset-2'
  }

  // Стили для удаленных сообщений
  const deletedClassName = msg.isDeleted ? ' opacity-40 select-none' : ''

  // Стили никнеймов
  const twitchColor = msg.user.color
  const nameStyle = useColoredNames && twitchColor ? { color: twitchColor } : undefined
  const nameClassName = !nameStyle ? 'font-bold text-primary mr-2 break-words' : 'font-bold mr-2 break-words'

  // Никнейм для отображения
  const displaySenderName = msg.user.displayName || msg.user.nick

  // Системные сообщения
  if (msg.isSystem) {
    const isAlert = msg.command === TwitchIrcCommand.USER_NOTICE && !msg.isAnnouncement

    let systemColorClass = 'text-warning/80 font-medium italic'

    if (msg.isAnnouncement) {
      systemColorClass = 'text-secondary font-semibold' // Красивый яркий цвет для анонса
    } else if (isAlert) {
      systemColorClass = 'text-info font-medium' // Цвет для подписок и рейдов
    }

    return (
      <div className={`${containerClassName} ${systemColorClass}`}>
        <span className="text-xs text-base-content/40 mr-2 select-none">
          {msg.timestamp}
        </span>
        <span className="mr-2">
          {isAlert || msg.isAnnouncement ?
            <LuSparkles className="w-4 h-4 inline align-middle" />
            :
            <LuWrench className="w-4 h-4 inline align-middle" />
          }
        </span>
        {msg.isAnnouncement && <span className="mr-2">{displaySenderName}:</span>}
        <span>{msg.text}</span>
      </div>
    )
  }

  // Текстовые сообщения
  const iconClassName = 'w-4 h-4 inline align-middle mr-1'

  return (
    <div className={`${containerClassName} ${deletedClassName}`}>
      <span className="inline-block select-none mr-1.5 align-middle">
        <span className="text-xs text-base-content/40 mr-1.5">
          {msg.timestamp}
        </span>

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
