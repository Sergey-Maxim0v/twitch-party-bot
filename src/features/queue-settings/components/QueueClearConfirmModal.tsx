import { type FC, useEffect } from 'react'
import { LuTriangleAlert } from 'react-icons/lu'
import { QUEUE_CLEAR_UI } from '../../../constants/queue.constants.ts'

interface QueueClearConfirmModalProps {
  /** Вопрос подтверждения очистки. */
  title: string;
  /** Закрыть окно без очистки. */
  onCancel: () => void;
  /** Подтвердить очистку. */
  onConfirm: () => void;
}

/**
 * Модальное окно подтверждения очистки очереди.
 */
export const QueueClearConfirmModal: FC<QueueClearConfirmModalProps> = ({ onCancel, onConfirm, title }) => {
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
          <LuTriangleAlert className="text-2xl" />
        </div>

        <h3 className="font-bold text-xl text-base-content">
          {title}
        </h3>

        <p className="text-sm text-base-content/60">
          {QUEUE_CLEAR_UI.WARNING}
        </p>

        <div className="modal-action w-full mt-2 flex gap-2">
          <button className="btn btn-ghost btn-sm flex-1" onClick={onCancel} type="button">
            {QUEUE_CLEAR_UI.CANCEL}
          </button>

          <button className="btn btn-error btn-sm flex-1" onClick={onConfirm} type="button">
            {QUEUE_CLEAR_UI.CONFIRM}
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
