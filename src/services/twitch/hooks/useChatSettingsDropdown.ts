import { type FocusEvent, useRef, useState } from 'react'
import { TWITCH_CHAT_SETTINGS } from '../../../constants/twitch.constants.ts'
import { useEscapeKey } from '../../../hooks/useEscapeKey.ts'

/** Управление видимостью панели настроек чата. */
export const useChatSettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isRestoringFocus = useRef(false)

  const close = (): void => setIsOpen(false)

  const closeOnEscape = (): void => {
    close()
    if (document.activeElement === buttonRef.current) return

    isRestoringFocus.current = true
    buttonRef.current?.focus()
  }

  useEscapeKey(closeOnEscape, isOpen)

  const openOnKeyboardFocus = (event: FocusEvent<HTMLButtonElement>): void => {
    if (isRestoringFocus.current) {
      isRestoringFocus.current = false
      return
    }

    if (!event.currentTarget.matches(TWITCH_CHAT_SETTINGS.DROPDOWN.FOCUS_VISIBLE)) return

    setIsOpen(true)
  }

  const closeOnFocusOut = (event: FocusEvent<HTMLDivElement>): void => {
    if (event.currentTarget.contains(event.relatedTarget)) return

    close()
  }

  const toggle = (): void => setIsOpen(open => !open)

  return { buttonRef, closeOnFocusOut, isOpen, openOnKeyboardFocus, toggle }
}
