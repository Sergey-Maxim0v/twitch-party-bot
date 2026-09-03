import { type FC, useRef } from 'react'
import { LuTrash2, LuUserX, LuCopy, LuInfo, LuClock, LuGamepad } from 'react-icons/lu'
import type { QueuePlayer } from '../types.ts'
import { QUEUE_SOURCE_META } from '../constants.ts'
import QueueElementModal from './QueueElementModal.tsx'

export interface QueueElementProps {
  className?: string;
  player: QueuePlayer;
  onDelete?: (userId: string) => void;
  onBan?: (userId: string) => void;
}

const QueueElement: FC<QueueElementProps> = ({
  className = '',
  player,
  onDelete,
  onBan,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

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

  const formattedTime = new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const handleCopyNickname = (): void => {
    const nameToCopy = gameNickname || displayedUsername || username
    navigator.clipboard.writeText(nameToCopy).catch(err => {
      console.error('Не удалось скопировать текст: ', err)
    })
  }

  const openModal = (): void => dialogRef.current?.showModal()
  const closeModal = (): void => dialogRef.current?.close()

  const sourceMeta = QUEUE_SOURCE_META[playerSource] || { label: playerSource, badgeClass: 'badge-ghost' }

  return (
    <div className={`p-2 rounded-lg border border-base-content/10 bg-base-100 shadow-sm hover:border-base-content/20 transition-all ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

        {/* Инфо об игроке */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-base-content/50 font-mono flex items-center gap-0.5">
              <LuClock className="w-3 h-3" />
              {formattedTime}
            </span>

            {isModerator && <span className="badge badge-success badge-xs font-semibold text-success-content">Модер</span>}
            {isVip && <span className="badge badge-warning badge-xs font-semibold text-warning-content">VIP</span>}
            {isSubscriber && <span className="badge badge-primary badge-xs font-semibold text-primary-content">Саб</span>}

            <span className={`badge badge-xs font-medium ${sourceMeta.badgeClass}`}>
              {sourceMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-base-content">{displayedUsername || username}</span>
            {gameNickname && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-base-200 border border-base-content/5 text-base-content/70 font-mono inline-flex items-center gap-1">
                <LuGamepad className="w-3 h-3" />
                {gameNickname}
              </span>
            )}
          </div>

          {rawMessage && (
            <p className="text-xs text-base-content/60 truncate max-w-full italic" title={rawMessage}>
              &ldquo;{rawMessage}&rdquo;
            </p>
          )}
        </div>

        {/* Быстрые действия */}
        <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
          <button
            className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-info"
            onClick={openModal}
            title="Подробнее"
          >
            <LuInfo className="w-3.5 h-3.5" />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-success"
            onClick={handleCopyNickname}
            title="Скопировать ник"
          >
            <LuCopy className="w-3.5 h-3.5" />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error hover:bg-error/10"
            onClick={() => onBan?.(userId)}
            title="Забанить"
          >
            <LuUserX className="w-3.5 h-3.5" />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error hover:bg-error/10"
            onClick={() => onDelete?.(userId)}
            title="Удалить из очереди"
          >
            <LuTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <QueueElementModal
        onBan={onBan}
        onClose={closeModal}
        onCopy={handleCopyNickname}
        onDelete={onDelete}
        player={player}
        ref={dialogRef}
      />
    </div>
  )
}

export default QueueElement
