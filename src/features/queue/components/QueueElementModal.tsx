import { forwardRef } from 'react'
import type { QueuePlayer } from '../types.ts'
import { QUEUE_SOURCE_META } from '../constants'
import { LuCopy, LuMessageSquare, LuTrash2, LuUser, LuUserX } from 'react-icons/lu'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'

export interface QueueElementModalProps {
  className?: string;
  player: QueuePlayer;
  onClose: () => void;
  onDelete?: (userId: string) => void;
  onBan?: (userId: string) => void;
  onCopy: () => void;
}

const QueueElementModal = forwardRef<HTMLDialogElement, QueueElementModalProps>(({
  className = '',
  player,
  onClose,
  onDelete,
  onBan,
  onCopy,
}, ref) => {
  const { settings } = useQueueSettings()

  const {
    userId,
    username,
    displayedUsername,
    rawMessage,
    playerSource,
    timestamp,
    isSubscriber,
    isModerator,
    isVip,
    gameNickname,
  } = player

  const sourceMeta = QUEUE_SOURCE_META[playerSource] || { label: playerSource, badgeClass: 'badge-ghost' }

  // Закрытие при клике на оверлей backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>): void => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <dialog
      className={`modal modal-bottom sm:modal-middle bg-black/40 backdrop-blur-xs ${className}`}
      onClick={handleBackdropClick}
      ref={ref}
    >
      <div className="modal-box border border-base-content/10 bg-base-100 text-base-content">
        <h3 className="font-bold text-lg flex items-center gap-2 border-b border-base-content/10 pb-2">
          <LuUser className="text-primary" /> Карта участника очереди
        </h3>

        <div className="py-4 space-y-3 text-sm">
          {/* Сетка параметров */}
          <div className="grid grid-cols-3 gap-2 bg-base-200/50 p-3 rounded-lg border border-base-content/5 font-mono text-xs">
            <span className="text-base-content/50">Twitch Login:</span>
            <span className="col-span-2 text-base-content font-bold">{displayedUsername ?? username}</span>

            <span className="text-base-content/50">Игровой ник:</span>
            <span className="col-span-2 text-success font-bold">
              {gameNickname ?? !settings.currentGame ? 'Игра не выбрана в настройках' : 'Не определен'}
            </span>

            <span className="text-base-content/50">Добавлен в:</span>
            <span className="col-span-2 text-base-content">
              {new Date(timestamp).toLocaleString('ru-RU')}
            </span>
          </div>

          {/* Роли и Источник */}
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-base-200 border border-base-content/5 text-xs">
              <span className="text-base-content/50">Источник:</span>
              <span className={`badge badge-sm font-semibold ${sourceMeta.badgeClass}`}>{sourceMeta.label}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-base-200 border border-base-content/5 text-xs">
              <span className="text-base-content/50">Модератор:</span>
              <span className={`badge badge-sm ${isModerator ? 'badge-success text-success-content' : 'badge-ghost text-base-content/40'}`}>
                {isModerator ? 'Да' : 'Нет'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-base-200 border border-base-content/5 text-xs">
              <span className="text-base-content/50">VIP-статус:</span>
              <span className={`badge badge-sm ${isVip ? 'badge-warning text-warning-content' : 'badge-ghost text-base-content/40'}`}>
                {isVip ? 'Да' : 'Нет'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-base-200 border border-base-content/5 text-xs">
              <span className="text-base-content/50">Подписчик:</span>
              <span className={`badge badge-sm ${isSubscriber ? 'badge-primary text-primary-content' : 'badge-ghost text-base-content/40'}`}>
                {isSubscriber ? 'Да' : 'Нет'}
              </span>
            </div>
          </div>

          {/* Полное сообщение */}
          <div className="flex flex-col gap-1 p-3 bg-base-200/30 border border-base-content/5 rounded-lg">
            <span className="text-xs text-base-content/50 flex items-center gap-1">
              <LuMessageSquare className="w-3 h-3" /> Текст сообщения:
            </span>
            <p className="text-xs italic whitespace-pre-wrap break-all bg-base-300/40 p-2 rounded border border-base-content/5">
              {rawMessage || <span className="text-base-content/30">Сообщение отсутствует</span>}
            </p>
          </div>
        </div>

        {/* Действия в модалке */}
        <div className="modal-action border-t border-base-content/10 pt-3 flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <button
              className="btn btn-error btn-outline btn-sm gap-1"
              onClick={() => { onBan?.(userId); onClose() }}
            >
              <LuUserX className="w-4 h-4" /> Забанить
            </button>
            <button
              className="btn btn-error btn-sm gap-1"
              onClick={() => { onDelete?.(userId); onClose() }}
            >
              <LuTrash2 className="w-4 h-4" /> Удалить
            </button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-neutral btn-sm gap-1" disabled={!settings.currentGame} onClick={onCopy}>
              <LuCopy className="w-4 h-4" /> Копировать ник
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
})

QueueElementModal.displayName = 'QueueElementModal'

export default QueueElementModal
