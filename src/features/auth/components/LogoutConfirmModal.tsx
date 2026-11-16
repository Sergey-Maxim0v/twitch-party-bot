import { type FC, useEffect } from 'react'
import { LuLogOut } from 'react-icons/lu'
import { TWITCH_LOGOUT_UI_MESSAGES } from '../../../constants/auth.constants.ts'

interface LogoutConfirmModalProps {
  /** Закрыть окно без выхода из аккаунта. */
  onCancel: () => void;
  /** Подтвердить выход из аккаунта. */
  onConfirm: () => void;
}

/**
 * Модальное окно подтверждения выхода из аккаунта Twitch.
 */
export const LogoutConfirmModal: FC<LogoutConfirmModalProps> = ({ onCancel, onConfirm }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <div className="modal modal-open z-200">
      <div className="modal-box max-w-sm flex flex-col items-center text-center gap-4 p-6">
        <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center text-error">
          <LuLogOut className="text-2xl" />
        </div>

        <h3 className="font-bold text-xl text-base-content">
          {TWITCH_LOGOUT_UI_MESSAGES.TITLE}
        </h3>

        <p className="text-sm text-base-content/60">
          {TWITCH_LOGOUT_UI_MESSAGES.DESCRIPTION}
        </p>

        <div className="modal-action w-full mt-2 flex gap-2">
          <button className="btn btn-ghost btn-sm flex-1" onClick={onCancel}>
            {TWITCH_LOGOUT_UI_MESSAGES.CANCEL}
          </button>

          <button className="btn btn-error btn-sm flex-1" onClick={onConfirm}>
            {TWITCH_LOGOUT_UI_MESSAGES.CONFIRM}
          </button>
        </div>
      </div>

      <div
        className="modal-backdrop bg-black/40 backdrop-blur-xs cursor-pointer"
        onClick={onCancel}
      />
    </div>
  )
}
