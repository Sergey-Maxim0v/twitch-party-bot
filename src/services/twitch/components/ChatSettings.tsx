import { type FC } from 'react'
import { LuSettings } from 'react-icons/lu'
import { ChatSettingsToggle } from './ChatSettingsToggle.tsx'
import type { ChatDisplayOptions } from '../types.ts'

type ChatSettingsProps = ChatDisplayOptions & {
  setUseColoredNames: (value: boolean) => void;
  setHighlightRoles: (value: boolean) => void;
  setIsShowDeletedMessages: (value: boolean) => void;
  setShowSystemNotifications: (value: boolean) => void;
  setHighlightPointsMessages: (value: boolean) => void;
  setShowEmotes: (value: boolean) => void;
}

/**
 * Выпадающая панель настроек отображения чата.
 */
export const ChatSettings: FC<ChatSettingsProps> = ({
  useColoredNames,
  setUseColoredNames,
  highlightRoles,
  setHighlightRoles,
  setIsShowDeletedMessages,
  isShowDeletedMessages,
  showSystemNotifications,
  setShowSystemNotifications,
  highlightPointsMessages,
  setHighlightPointsMessages,
  showEmotes,
  setShowEmotes,
}) => (
  <div className="dropdown dropdown-top group">
    <button
      aria-label="Настройки чата"
      className="btn btn-ghost btn-sm btn-square"
      tabIndex={0}
    >
      <LuSettings className="w-5 h-5 text-base-content/70" />
    </button>
    <div
      className="dropdown-content pointer-events-none group-focus-within:pointer-events-auto
                z-50 p-4 shadow-2xl bg-base-100 border border-base-300 rounded-box w-72 mb-2
                flex flex-col gap-3 overflow-hidden box-border"
      tabIndex={0}
    >
      <div className="text-xs font-bold uppercase tracking-wider
                    text-base-content/50 w-full select-none"
      >
        Отображение чата
      </div>

      <div className="w-full flex flex-col gap-3">
        <ChatSettingsToggle
          checked={useColoredNames}
          label="Цветные ники"
          onChange={setUseColoredNames}
        />

        <ChatSettingsToggle
          checked={showEmotes}
          label="Смайлики Twitch"
          onChange={setShowEmotes}
        />

        <ChatSettingsToggle
          checked={highlightRoles}
          label="Стили модеров, випов"
          onChange={setHighlightRoles}
        />

        <ChatSettingsToggle
          checked={highlightPointsMessages}
          label="Выделенные сообщения"
          onChange={setHighlightPointsMessages}
        />

        <ChatSettingsToggle
          checked={isShowDeletedMessages}
          label="Показать удаленные сообщения"
          onChange={setIsShowDeletedMessages}
        />

        <ChatSettingsToggle
          checked={showSystemNotifications}
          label="Показать системные сообщения"
          onChange={setShowSystemNotifications}
        />
      </div>
    </div>
  </div>
)
