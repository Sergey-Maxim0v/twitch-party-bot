import { type FC } from 'react'
import { LuSettings } from 'react-icons/lu'
import { TWITCH_CHAT_SETTINGS } from '../../../constants/twitch.constants.ts'
import { ChatSettingsPanel } from './ChatSettingsPanel.tsx'
import { useChatSettingsDropdown } from '../hooks/useChatSettingsDropdown.ts'
import type { ChatSettingsProps } from '../types.ts'

/** Кнопка и состояние выпадающей панели настроек чата. */
export const ChatSettings: FC<ChatSettingsProps> = props => {
  const { buttonRef, closeOnFocusOut, isOpen, openOnKeyboardFocus, toggle } = useChatSettingsDropdown()
  const { BASE_CLASS, CLOSE_CLASS, OPEN_CLASS } = TWITCH_CHAT_SETTINGS.DROPDOWN

  return (
    <div
      className={`${BASE_CLASS} ${isOpen ? OPEN_CLASS : CLOSE_CLASS}`}
      onBlur={closeOnFocusOut}
    >
      <button
        aria-expanded={isOpen}
        aria-label={TWITCH_CHAT_SETTINGS.BUTTON_LABEL}
        className={TWITCH_CHAT_SETTINGS.BUTTON_CLASS}
        onClick={toggle}
        onFocus={openOnKeyboardFocus}
        ref={buttonRef}
        type="button"
      >
        <LuSettings className="w-5 h-5 text-base-content/70" />
      </button>

      <ChatSettingsPanel {...props} />
    </div>
  )
}
