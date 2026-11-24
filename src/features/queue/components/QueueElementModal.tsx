import { forwardRef, type FC, type MouseEvent, type ReactNode } from 'react'
import { QUEUE_TYPES, type QueueEntryProps } from '../types.ts'
import { QUEUE_PLAYER_SOURCE_META } from '../../../constants/queue.constants.ts'
import { formatDateTime } from '../../../utils/dateTime.ts'
import { LuCopy, LuMessageSquare, LuTrash2, LuUser, LuUserX, LuX } from 'react-icons/lu'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'

interface QueueElementModalProps extends QueueEntryProps {
  /** Закрыть модальное окно. */
  onClose: () => void;
  /** Удалить игрока из текущей очереди. */
  onDelete?: () => void;
  /** Удалить игрока из всех очередей. */
  onDeleteEverywhere?: () => void;
  /** Забанить игрока. */
  onBan?: () => void;
  /** Скопировать игровой никнейм. */
  onCopy: () => void;
}

interface DetailChipProps {
  /** Подпись характеристики. */
  label: string;
  /** Значение характеристики. */
  children: ReactNode;
}

/** Плашка с подписью и значением в карточке игрока. */
const DetailChip: FC<DetailChipProps> = ({ label, children }) => (
  <div
    className="flex items-center gap-1.5 rounded-lg border border-base-300/60 bg-base-200/40
      px-2 py-1 text-[11px]"
  >
    <span className="text-base-content/50">{label}</span>
    {children}
  </div>
)

/**
 * Модальное окно с подробной карточкой участника очереди.
 */
export const QueueElementModal = forwardRef<HTMLDialogElement, QueueElementModalProps>(({
  className = '',
  player,
  onClose,
  onDelete,
  onDeleteEverywhere,
  onBan,
  onCopy,
  queueType,
}, ref) => {
  const { settings } = useQueueSettings()

  const {
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

  const sourceMeta = QUEUE_PLAYER_SOURCE_META[playerSource] || { label: playerSource, badgeClass: 'badge-ghost' }

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>): void => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <dialog
      className={`modal modal-bottom bg-black/65 sm:modal-middle ${className}`}
      onClick={handleBackdropClick}
      ref={ref}
    >
      <div
        className="modal-box max-w-lg overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-3xl
          border border-base-300/70 bg-base-100 p-0 text-base-content shadow-2xl sm:rounded-3xl"
      >
        <div className="relative overflow-hidden border-b border-base-300/60 bg-linear-to-br from-primary/15 via-base-100 to-base-100 px-5 py-4">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />

          <div className="relative flex items-center gap-3 pr-8">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10
                text-primary ring-1 ring-primary/20"
            >
              <LuUser className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-base-content">Карта участника очереди</h3>
              <p className="truncate text-xs text-base-content/50">@{displayedUsername ?? username}</p>
            </div>
          </div>

          <button
            aria-label="Закрыть"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-base-content/40 transition-colors
              hover:bg-base-200/80 hover:text-base-content"
            onClick={onClose}
            type="button"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4 text-sm">
          <div
            className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5 rounded-2xl border
              border-base-300/60 bg-base-200/40 p-3.5 text-xs"
          >
            <span className="text-base-content/50">Twitch login</span>
            <span className="truncate text-right font-mono font-semibold text-base-content">
              {displayedUsername ?? username}
            </span>

            <span className="text-base-content/50">Игровой ник</span>
            <span
              className={`truncate text-right font-mono font-semibold
                ${gameNickname ? 'text-base-content' : 'italic text-base-content/40'}`}
            >
              {gameNickname ?? (!settings?.currentGame ? 'Игра не выбрана в настройках' : 'Не определен')}
            </span>

            <span className="text-base-content/50">Добавлен в</span>
            <span className="text-right font-mono text-[11px] text-base-content/60">
              {formatDateTime(timestamp)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <DetailChip label="Источник">
              <span className={`badge badge-xs font-semibold ${sourceMeta.badgeClass}`}>{sourceMeta.label}</span>
            </DetailChip>
            <DetailChip label="Модератор">
              <span className={`badge badge-xs ${isModerator ? 'badge-success text-success-content' : 'badge-ghost text-base-content/40'}`}>
                {isModerator ? 'Да' : 'Нет'}
              </span>
            </DetailChip>
            <DetailChip label="VIP-статус">
              <span className={`badge badge-xs ${isVip ? 'badge-warning text-warning-content' : 'badge-ghost text-base-content/40'}`}>
                {isVip ? 'Да' : 'Нет'}
              </span>
            </DetailChip>
            <DetailChip label="Подписчик">
              <span className={`badge badge-xs ${isSubscriber ? 'badge-primary text-primary-content' : 'badge-ghost text-base-content/40'}`}>
                {isSubscriber ? 'Да' : 'Нет'}
              </span>
            </DetailChip>
          </div>

          <div className="rounded-2xl border border-base-300/60 bg-base-200/30 p-3">
            <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-base-content/50">
              <LuMessageSquare className="h-3 w-3" /> Текст сообщения
            </span>
            <p
              className="whitespace-pre-wrap break-all rounded-xl bg-base-100/60 p-2.5 text-xs italic
                leading-relaxed text-base-content/70 ring-1 ring-base-300/40"
            >
              {rawMessage || <span className="text-base-content/30">Сообщение отсутствует</span>}
            </p>
          </div>
        </div>

        <div
          className="modal-action m-0 flex flex-wrap items-center justify-between gap-2 border-t
            border-base-300/60 bg-base-200/30 px-5 py-3.5"
        >
          <div className="flex flex-wrap gap-1.5">
            <button
              className="btn btn-sm h-9 min-h-9 gap-1.5 rounded-xl border-error/25 bg-error/5 px-3 text-error
                shadow-none hover:border-error/50 hover:bg-error/10 hover:text-error"
              onClick={() => {
                onClose()
                onBan?.()
              }}
              type="button"
            >
              <LuUserX className="h-4 w-4" /> Забанить
            </button>
            <button
              className="btn btn-sm h-9 min-h-9 gap-1.5 rounded-xl border-0 bg-error px-3 text-error-content
                shadow-sm shadow-error/20 hover:brightness-105 disabled:border-base-300/40 disabled:bg-base-300
                disabled:text-base-content/30 disabled:shadow-none"
              disabled={queueType === QUEUE_TYPES.HISTORY}
              onClick={() => {
                onClose()
                onDelete?.()
              }}
              type="button"
            >
              <LuTrash2 className="h-4 w-4" /> Удалить
            </button>
            <button
              className="btn btn-sm h-9 min-h-9 gap-1.5 rounded-xl border-error/25 bg-error/5 px-3 text-error
                shadow-none hover:border-error/50 hover:bg-error/10 hover:text-error
                disabled:border-base-300/40 disabled:bg-transparent disabled:text-base-content/30"
              disabled={queueType === QUEUE_TYPES.HISTORY}
              onClick={() => {
                onClose()
                onDeleteEverywhere?.()
              }}
              type="button"
            >
              <LuTrash2 className="h-4 w-4" /> Удалить из всех очередей
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              className="btn btn-sm h-9 min-h-9 gap-1.5 rounded-xl border border-base-300/70 bg-base-100/60 px-3
                text-base-content/70 shadow-none hover:border-primary/30 hover:bg-primary/10 hover:text-primary
                disabled:border-base-300/40 disabled:bg-transparent disabled:text-base-content/30"
              disabled={!gameNickname}
              onClick={onCopy}
              type="button"
            >
              <LuCopy className="h-4 w-4" /> Копировать ник
            </button>
            <button
              className="btn btn-sm h-9 min-h-9 rounded-xl border-0 bg-base-content px-4 text-base-100
                shadow-sm hover:bg-base-content/85"
              onClick={onClose}
              type="button"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
})

QueueElementModal.displayName = 'QueueElementModal'
