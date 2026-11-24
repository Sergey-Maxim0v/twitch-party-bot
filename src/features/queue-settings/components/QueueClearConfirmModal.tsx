import { type FC } from 'react'
import { QUEUE_CLEAR_UI } from '../../../constants/queue.constants.ts'
import { ConfirmModal, type ConfirmModalHandlers } from '../../../components/ConfirmModal.tsx'

interface QueueClearConfirmModalProps extends ConfirmModalHandlers {
  /** Вопрос подтверждения очистки. */
  title: string;
}

/**
 * Модальное окно подтверждения очистки очереди.
 */
export const QueueClearConfirmModal: FC<QueueClearConfirmModalProps> = ({ onCancel, onConfirm, title }) => (
  <ConfirmModal
    cancelText={QUEUE_CLEAR_UI.CANCEL}
    confirmText={QUEUE_CLEAR_UI.CONFIRM}
    description={QUEUE_CLEAR_UI.WARNING}
    onCancel={onCancel}
    onConfirm={onConfirm}
    title={title}
  />
)
