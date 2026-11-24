import { type FC, type ReactNode } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey.ts'

/** Обработчики подтверждения и отмены действия. */
export interface ConfirmModalHandlers {
  /** Закрыть окно без подтверждения. */
  onCancel: () => void;
  /** Подтвердить действие. */
  onConfirm: () => void;
}

interface ConfirmModalProps extends ConfirmModalHandlers {
  /** Заголовок окна. */
  title: string;
  /** Пояснение под заголовком. */
  description: string;
  /** Текст кнопки подтверждения. */
  confirmText: string;
  /** Текст кнопки отмены. */
  cancelText: string;
  /** Значок над заголовком. */
  icon?: ReactNode;
}

/**
 * Модальное окно подтверждения действия с кнопками отмены и подтверждения.
 */
export const ConfirmModal: FC<ConfirmModalProps> = ({
  title,
  description,
  confirmText,
  cancelText,
  icon,
  onCancel,
  onConfirm,
}) => {
  useEscapeKey(onCancel)

  return (
    <div className="modal modal-open z-200">
      <div className="modal-box max-w-sm flex flex-col items-center text-center gap-4 p-6">
        {icon && (
          <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center text-error">
            {icon}
          </div>
        )}

        <h3 className="font-bold text-xl text-base-content">
          {title}
        </h3>

        <p className="text-sm text-base-content/60">
          {description}
        </p>

        <div className="modal-action w-full mt-2 flex gap-2">
          <button className="btn btn-ghost btn-sm flex-1" onClick={onCancel} type="button">
            {cancelText}
          </button>

          <button className="btn btn-error btn-sm flex-1" onClick={onConfirm} type="button">
            {confirmText}
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
