import { type FC } from 'react'
import { TWITCH_CHAT_SETTINGS } from '../../../constants/twitch.constants.ts'
import { ChatSettingsToggle } from './ChatSettingsToggle.tsx'
import type { ChatSettingsProps } from '../types.ts'

/** Переключатели настроек отображения чата. */
export const ChatSettingsPanel: FC<ChatSettingsProps> = settings => {
  const { COLORED_NAMES, DELETED, EMOTES, HIGHLIGHTS, ROLES, SYSTEM } = TWITCH_CHAT_SETTINGS.TOGGLE_LABELS
  const toggles = [
    [COLORED_NAMES, settings.useColoredNames, settings.setUseColoredNames],
    [EMOTES, settings.showEmotes, settings.setShowEmotes],
    [ROLES, settings.highlightRoles, settings.setHighlightRoles],
    [HIGHLIGHTS, settings.highlightPointsMessages, settings.setHighlightPointsMessages],
    [DELETED, settings.isShowDeletedMessages, settings.setIsShowDeletedMessages],
    [SYSTEM, settings.showSystemNotifications, settings.setShowSystemNotifications],
  ] as const

  return (
    <div className={TWITCH_CHAT_SETTINGS.PANEL_CLASS} tabIndex={0}>
      <div className="text-xs font-bold uppercase tracking-wider
                      text-base-content/50 w-full select-none"
      >
        {TWITCH_CHAT_SETTINGS.TITLE}
      </div>

      <div className="w-full flex flex-col gap-3">
        {toggles.map(([label, checked, onChange]) => (
          <ChatSettingsToggle
            checked={checked}
            key={label}
            label={label}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}
