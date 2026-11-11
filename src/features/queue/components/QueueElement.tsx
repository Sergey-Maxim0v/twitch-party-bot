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
    id: userId,
    disabled: isHistory,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formattedTime = formatTimeWithSeconds(timestamp)

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
      className={`py-1.5 px-2.5 rounded-lg border border-base-content/5 bg-base-200/30
        hover:bg-base-200/60 transition-all flex items-start gap-2 shadow-xs
        ${isDragging ? 'opacity-0 border-primary/30 bg-base-300' : ''}
        ${className}`}
      ref={setNodeRef}
      style={style}
    >
      {!isHistory && (
        <div
          {...attributes}
          {...listeners}
          className={'shrink-0 self-center p-0.5 cursor-grab active:cursor-grabbing text-base-content/30 hover:text-base-content/70'
              + ' transition-colors rounded-sm hover:bg-base-content/5 tooltip tooltip-right  active:before:hidden active:after:hidden'}
          data-tip="Зажмите, чтобы перетащить игрока"
        >
          <LuGripVertical className="w-4 h-4" />
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0 w-full">
          <span className="text-[11px] text-base-content/40 font-mono flex items-center gap-0.5 shrink-0 select-none">
            <LuClock className="w-2.5 h-2.5 opacity-70" />
            {formattedTime}
          </span>

          <div className="flex items-center gap-0.5 h-3.5 shrink-0">
            {isModerator && (
              <span className="badge badge-success text-[9px] font-bold h-3.5 px-1 text-success-content border-none">
                Модер
              </span>
            )}

            {isVip && (
              <span className="badge badge-warning text-[9px] font-bold h-3.5 px-1 text-warning-content border-none">
                VIP
              </span>
            )}

            {isSubscriber && (
              <span className="badge badge-primary text-[9px] font-bold h-3.5 px-1 text-primary-content border-none">
                Саб
              </span>
            )}
          </div>

          <span className="font-semibold text-xs text-base-content tracking-wide wrap-break-word">
            {displayedUsername || username}
          </span>

          {settings?.currentGame && gameNickname && (
            <span
              className={'text-[10px] h-3.5 px-1 rounded bg-base-300 text-success font-mono font-bold'
                      + ' inline-flex items-center gap-0.5 border border-base-content/5 shrink-0'
                      + ' cursor-pointer select-none hover:bg-base-300/80 transition-colors'}
              onClick={handleCopyNickname}
              title="Кликните, чтобы скопировать ник"
            >
              <LuGamepad className="w-2.5 h-2.5" />
              {gameNickname}
            </span>
          )}
        </div>

        {rawMessage && (
          <p
            className="text-[11px] text-base-content/40 truncate w-full italic mt-0.5 leading-tight"
            title={rawMessage}
          >
            {rawMessage}
          </p>
        )}

        <div className="flex items-center justify-end gap-1 h-5 mt-1">
          <button
            className="btn btn-ghost btn-xs h-5 px-1.5 min-h-0 text-[10px] text-base-content/40 hover:text-info hover:bg-base-300/50 flex items-center gap-1"
            onClick={openModal}
            title="Подробнее"
          >
            <LuInfo className="w-3 h-3" />
            <span>Подробно</span>
          </button>

          <button
            className="btn btn-ghost btn-xs h-5 px-1.5 min-h-0 text-[10px] text-base-content/20 hover:text-error hover:bg-error/10 flex items-center gap-1"
            onClick={handleBan}
            title="Забанить"
          >
            <LuUserX className="w-3 h-3" />
            <span>Бан</span>
          </button>

          {queueType !== QUEUE_TYPES.HISTORY && (
            <button
              className="btn btn-ghost btn-xs h-5 px-1.5 min-h-0 text-[10px] text-base-content/20 hover:text-error hover:bg-error/10 flex items-center gap-1"
              onClick={handleDelete}
              title={QUEUE_COMMAND_LABELS.delete}
            >
              <LuTrash2 className="w-3 h-3" />
              <span>Удалить</span>
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
