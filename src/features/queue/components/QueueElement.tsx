import { type FC, useRef } from 'react'
import { LuTrash2, LuUserX, LuInfo, LuClock, LuGamepad, LuGripVertical } from 'react-icons/lu'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { QUEUE_TYPES, type QueuePlayer, type QueueType } from '../types.ts'
import { QueueElementModal } from './QueueElementModal.tsx'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from '../hooks/useQueue.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { APP_LOG_FALLBACK_ACTOR } from '../../../constants/app-logs.constants.ts'
import { QUEUE_COMMAND_LABELS } from '../../../constants/queue.constants.ts'
import { formatTimeWithSeconds } from '../../../utils/dateTime.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'

interface QueueElementProps {
  /** Дополнительные CSS-классы карточки. */
  className?: string;
  /** Данные игрока. */
  player: QueuePlayer;
  /** Очередь, в которой находится игрок. */
  queueType: QueueType;
}

/**
 * Карточка участника очереди с ролями, игровым ником и действиями.
 */
export const QueueElement: FC<QueueElementProps> = ({
  className = '',
  player,
  queueType,
}) => {
  const { settings } = useQueueSettings()
  const { userDisplayName } = useAuth()
  const { removePlayerFromQueue, banPlayerFromQueue, removePlayerFromAllQueues } = useQueue()

  const dialogRef = useRef<HTMLDialogElement>(null)

  const {
    queueEntryId,
    userId,
    username,
    displayedUsername,
    rawMessage,
    timestamp,
    isSubscriber,
    isModerator,
    isVip,
    gameNickname,
  } = player

  const isHistory = queueType === QUEUE_TYPES.HISTORY
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: queueEntryId,
    disabled: isHistory,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formattedTime = formatTimeWithSeconds(timestamp)

  const accentClass = isHistory
    ? 'before:bg-base-300/70'
    : queueType === QUEUE_TYPES.ACTIVE
      ? 'before:bg-primary/70'
      : 'before:bg-warning/80'

  const handleCopyNickname = (): void => {
    const nameToCopy = gameNickname || displayedUsername || username
    navigator.clipboard.writeText(nameToCopy).catch(err => {
      console.error('Не удалось скопировать текст: ', err)
    })
  }

  const handleBan = () => {
    banPlayerFromQueue({
      userId,
      username,
      displayedUsername: displayedUsername,
      actorUsername: userDisplayName ?? APP_LOG_FALLBACK_ACTOR,
      source: APP_LOG_SOURCES.STREAMER_UI,
    })
  }

  const handleDelete = () => {
    removePlayerFromQueue({
      userId,
      username,
      source: APP_LOG_SOURCES.STREAMER_UI,
      actorUsername: userDisplayName ?? APP_LOG_FALLBACK_ACTOR,
      targetQueueType: queueType,
    })
  }

  const handleDeleteEverywhere = () => {
    removePlayerFromAllQueues({
      userId,
      username,
      source: APP_LOG_SOURCES.STREAMER_UI,
      actorUsername: userDisplayName ?? APP_LOG_FALLBACK_ACTOR,
    })
  }

  const openModal = (): void => dialogRef.current?.showModal()
  const closeModal = (): void => dialogRef.current?.close()

  return (
    <div
      className={`group relative flex items-start gap-2 rounded-xl border border-base-300/60 bg-base-100/70
        p-2.5 shadow-xs transition-colors duration-200 before:absolute before:inset-y-2 before:left-0
        before:w-0.75 before:rounded-full ${accentClass}
        hover:border-base-300/80 hover:bg-base-100
        ${isDragging ? 'border-primary/40 bg-base-100 opacity-0' : ''}
        ${className}`}
      ref={setNodeRef}
      style={style}
    >
      {!isHistory && (
        <div
          {...attributes}
          {...listeners}
          className="tooltip tooltip-right mt-0.5 shrink-0 cursor-grab touch-none rounded-lg p-1
            text-base-content/25 transition-colors hover:bg-base-200/70 hover:text-base-content/60
            active:cursor-grabbing active:before:hidden active:after:hidden"
          data-tip="Зажмите, чтобы перетащить игрока"
        >
          <LuGripVertical className="h-4 w-4" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          <span
            className="inline-flex shrink-0 select-none items-center gap-1 rounded-md bg-base-200/70 px-1.5
              py-0.5 font-mono text-[10px] font-medium tabular-nums text-base-content/45"
          >
            <LuClock className="h-2.5 w-2.5 opacity-70" />
            {formattedTime}
          </span>

          <div className="flex h-4 shrink-0 items-center gap-1.5">
            {isModerator && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-base-content/45">
                <span className="h-1.5 w-1.5 rounded-full bg-success ring-1 ring-base-content/15" />
                Модер
              </span>
            )}

            {isVip && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-base-content/45">
                <span className="h-1.5 w-1.5 rounded-full bg-warning ring-1 ring-base-content/15" />
                VIP
              </span>
            )}

            {isSubscriber && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-base-content/45">
                <span className="h-1.5 w-1.5 rounded-full bg-primary ring-1 ring-base-content/15" />
                Саб
              </span>
            )}
          </div>

          <span className="min-w-0 wrap-break-word text-[13px] font-semibold leading-tight text-base-content">
            {displayedUsername || username}
          </span>

          {settings?.currentGame && gameNickname && (
            <button
              className="inline-flex shrink-0 cursor-pointer select-none items-center gap-1 rounded-md border
                border-base-300/60 bg-base-200/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold
                text-base-content/70 transition-colors hover:border-base-300 hover:bg-base-200 hover:text-base-content"
              onClick={handleCopyNickname}
              title="Кликните, чтобы скопировать ник"
              type="button"
            >
              <LuGamepad className="h-2.5 w-2.5 text-base-content/40" />
              {gameNickname}
            </button>
          )}
        </div>

        {rawMessage && (
          <p
            className="line-clamp-2 w-full text-[11px] italic leading-snug text-base-content/45"
            title={rawMessage}
          >
            {rawMessage}
          </p>
        )}

        <div className="flex items-center justify-end gap-0.5">
          <button
            aria-label="Подробнее"
            className="tooltip tooltip-top rounded-lg p-1.5 text-base-content/30 transition-colors
              hover:bg-base-200/70 hover:text-base-content/70"
            data-tip="Подробнее"
            onClick={openModal}
            type="button"
          >
            <LuInfo className="h-3.5 w-3.5" />
          </button>

          <button
            aria-label="Забанить"
            className="tooltip tooltip-top rounded-lg p-1.5 text-base-content/25 transition-colors
              hover:bg-error/10 hover:text-error"
            data-tip="Забанить"
            onClick={handleBan}
            type="button"
          >
            <LuUserX className="h-3.5 w-3.5" />
          </button>

          {queueType !== QUEUE_TYPES.HISTORY && (
            <button
              aria-label={QUEUE_COMMAND_LABELS.delete}
              className="tooltip tooltip-top rounded-lg p-1.5 text-base-content/25 transition-colors
                hover:bg-error/10 hover:text-error"
              data-tip={QUEUE_COMMAND_LABELS.delete}
              onClick={handleDelete}
              type="button"
            >
              <LuTrash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <QueueElementModal
        onBan={handleBan}
        onClose={closeModal}
        onCopy={handleCopyNickname}
        onDelete={handleDelete}
        onDeleteEverywhere={handleDeleteEverywhere}
        player={player}
        queueType={queueType}
        ref={dialogRef}
      />
    </div>
  )
}
