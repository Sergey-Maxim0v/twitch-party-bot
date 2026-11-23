import { useState, type FC } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../hooks/useAuth'
import { LuLogOut, LuUser } from 'react-icons/lu'
import { Avatar } from '../../../components/Avatar.tsx'
import { LogoutConfirmModal } from './LogoutConfirmModal.tsx'
import { TWITCH_LOGOUT_UI_MESSAGES } from '../../../constants/auth.constants.ts'

/**
 * Строка меню профиля с данными аккаунта и подтверждением выхода.
 */
export const LogoutToggle: FC = () => {
  const { session, logout, userDisplayName, userAvatar } = useAuth()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = (): void => {
    setIsConfirmOpen(true)
  }

  const closeConfirm = (): void => {
    setIsConfirmOpen(false)
  }

  const confirmLogout = (): void => {
    setIsConfirmOpen(false)
    logout()
  }

  return (
    <>
      <div
        className="flex items-center justify-between px-3 py-2.5
              hover:bg-error/10 rounded-lg transition-colors select-none"
        onClick={openConfirm}
        role="button"
      >
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1 w-0">
          <LuUser className="text-base text-base-content/60 shrink-0" />

          <span className="opacity-60 font-medium shrink-0">аккаунт:</span>

          <div className="flex items-center gap-1.5 min-w-0 truncate">
            {userAvatar && (
              <Avatar alt={userDisplayName || session?.login || 'Аватар'} src={userAvatar} />
            )}
            <span className="font-bold truncate max-w-27.5">
              {userDisplayName || session?.login}
            </span>
          </div>
        </div>

        <span
          className="badge badge-error badge-outline badge-sm font-medium flex items-center gap-1 text-xs shrink-0"
        >
          <LuLogOut className="text-[10px]" />
          <span>{TWITCH_LOGOUT_UI_MESSAGES.CONFIRM}</span>
        </span>
      </div>

      {isConfirmOpen && createPortal(
        <LogoutConfirmModal onCancel={closeConfirm} onConfirm={confirmLogout} />,
        document.body,
      )}
    </>
  )
}
