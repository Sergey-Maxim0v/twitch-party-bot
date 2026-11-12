import { useState, useRef, useEffect, type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { LuSend } from 'react-icons/lu'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import { TWITCH_CHAT_MESSAGE_MAX_LENGTH, TWITCH_CHAT_MESSAGE_MIN_LENGTH } from '../../../constants/twitch.constants.ts'
import { TWITCH_CHAT_ACCESS_STATUSES } from '../../socket/types.ts'
import { CHAT_INPUT_STYLES, TWITCH_CHAT_STATUS_BUTTON_CLASSES } from '../../../constants/ui.constants.ts'

interface ChatInputProps {
  onSendMessage: (text: string) => boolean;
  actions?: ReactNode;
}

/**
 * Поле ввода и отправки сообщения в чат Twitch.
 */
export const ChatInput = ({ onSendMessage, actions }: ChatInputProps) => {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isOverflowed, setIsOverflowed] = useState(false)

  const socketContext = useSocketContext()

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (!value.trim()) {
      textarea.style.height = CHAT_INPUT_STYLES.MIN_HEIGHT
      return
    }

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setValue(text)

    const textarea = textareaRef.current
    if (!textarea) return

    if (!text.trim()) {
      setIsOverflowed(false)
      return
    }

    setIsOverflowed(textarea.scrollHeight > CHAT_INPUT_STYLES.MAX_HEIGHT_PX)
  }

  const sendMessage = (): void => {
    const trimmedValue = value.trim()
    if (!trimmedValue) return

    const isSent = onSendMessage(trimmedValue)

    // Неудачная отправка сохраняет текст, чтобы сообщение не потерялось
    if (!isSent) return

    setValue('')
    setIsOverflowed(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return

    e.preventDefault()
    sendMessage()
  }

  const currentStatus = socketContext?.chatAccessStatus || TWITCH_CHAT_ACCESS_STATUSES.OFFLINE
  const buttonStatusClass = TWITCH_CHAT_STATUS_BUTTON_CLASSES[currentStatus] || 'btn-primary'

  return (
    <div className="p-3 shrink-0">
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className={`textarea textarea-bordered textarea-sm w-full bg-base-100 text-sm
                    focus:outline-none placeholder-base-content/40 resize-none
                    min-h-8 max-h-32 py-1.5 leading-relaxed custom-scrollbar
                    ${isOverflowed ? 'overflow-y-auto' : 'overflow-hidden'}`}
          maxLength={TWITCH_CHAT_MESSAGE_MAX_LENGTH}
          minLength={TWITCH_CHAT_MESSAGE_MIN_LENGTH}
          name="chat-message"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Отправить сообщение"
          ref={textareaRef}
          rows={1}
          value={value}
        />

        <div className="flex justify-between items-center w-full">
          {actions}

          <button
            className={`btn btn-sm btn-square transition-colors duration-200 ${buttonStatusClass}`}
            disabled={!value.trim()}
            title="Отправить"
            type="submit"
          >
            <LuSend className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  )
}
