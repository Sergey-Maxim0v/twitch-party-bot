import { type FC } from 'react'
import { LuLogOut } from 'react-icons/lu'
import { TWITCH_LOGOUT_UI_MESSAGES } from '../../../constants/auth.constants.ts'
import { ConfirmModal, type ConfirmModalHandlers } from '../../../components/ConfirmModal.tsx'

/**
 * Модальное окно подтверждения выхода из аккаунта Twitch.
 */
export const LogoutConfirmModal: FC<ConfirmModalHandlers> = ({ onCancel, onConfirm }) => (
  <ConfirmModal
    cancelText={TWITCH_LOGOUT_UI_MESSAGES.CANCEL}
    confirmText={TWITCH_LOGOUT_UI_MESSAGES.CONFIRM}
    description={TWITCH_LOGOUT_UI_MESSAGES.DESCRIPTION}
    icon={<LuLogOut className="text-2xl" />}
    onCancel={onCancel}
    onConfirm={onConfirm}
    title={TWITCH_LOGOUT_UI_MESSAGES.TITLE}
  />
)
