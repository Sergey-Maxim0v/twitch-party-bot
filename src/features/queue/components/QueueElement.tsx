import { type FC, useRef } from 'react'
import { LuTrash2, LuUserX, LuCopy, LuInfo, LuClock, LuGamepad } from 'react-icons/lu'
import { QUEUE_TYPES, type QueuePlayer, type QueueType } from '../types.ts'
import QueueElementModal from './QueueElementModal.tsx'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from '../hooks/useQueue.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'

export interface QueueElementProps {
  className?: string;
  player: QueuePlayer;
  queueType: QueueType;
}

const QueueElement: FC<QueueElementProps> = ({
  className = '',
  player,
  queueType,
}) => {
  const { settings } = useQueueSettings()
  const { userDisplayName } = useAuth()
  const { removePlayerFromQueue, banPlayerFromQueue } = useQueue()

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

  const handleBan = () => {
    banPlayerFromQueue({
      userId: userId,
      username: username,
      displayedUsername: displayedUsername,
      actorUsername: userDisplayName ?? 'Application',
      source: LOG_SOURCE.STREAMER_UI,
    })
  }

  const handleDelete = () => {
    removePlayerFromQueue({
      userId: userId,
      source: LOG_SOURCE.STREAMER_UI,
      actorUsername: userDisplayName ?? 'Application',
      targetQueueType: queueType,
    })
  }

  const openModal = (): void => dialogRef.current?.showModal()
  const closeModal = (): void => dialogRef.current?.close()

  return (
    <div className={'py-1.5 px-2.5 rounded-lg border border-base-content/5 bg-base-200/30'
        + ' hover:bg-base-200/60 transition-all flex flex-col gap-0.5 shadow-xs '
        + className}
    >

      {/* СТРОКА 1: Время, Роли, Никнеймы */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0 w-full">
        {/* Время */}
        <span className="text-[11px] text-base-content/40 font-mono flex items-center gap-0.5 shrink-0 select-none">
          <LuClock className="w-2.5 h-2.5 opacity-70" />
          {formattedTime}
        </span>

        {/* Роли и статус */}
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

        {/* Никнейм */}
        <span className="font-semibold text-xs text-base-content tracking-wide wrap-break-word">
          {displayedUsername || username}
        </span>

        {/* Игровой ник */}
        {gameNickname && (
          <span className={'text-[10px] h-3.5 px-1 rounded bg-base-300 text-success font-mono font-bold'
              + ' inline-flex items-center gap-0.5 border border-base-content/5 shrink-0'}
          >
            <LuGamepad className="w-2.5 h-2.5" />
            {gameNickname}
          </span>
        )}
      </div>

      {/* СТРОКА 2: Сообщение */}
      {rawMessage && (
        <p
          className="text-[11px] text-base-content/40 truncate w-full italic mt-0.5 leading-tight"
          title={rawMessage}
        >
          {rawMessage}
        </p>
      )}

      {/* СТРОКА 3: Панель управления кнопками */}
      <div className="flex items-center justify-end gap-0.5 h-4 mt-0.5">
        <button
          className="btn btn-ghost btn-xs w-5 h-4 min-h-0 p-0 text-base-content/40 hover:text-info hover:bg-base-300/50"
          onClick={openModal}
          title="Подробнее"
        >
          <LuInfo className="w-3 h-3" />
        </button>

        {settings?.currentGame && (
          <button
            className={'btn btn-ghost btn-xs w-5 h-4 min-h-0 p-0 text-base-content/40'
                + ' hover:text-success hover:bg-base-300/50'
                + ' disabled:text-base-content/20 disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed'}
            disabled={!gameNickname}
            onClick={handleCopyNickname}
            title={gameNickname ? 'Скопировать ник' : 'Игровой никнейм не определен'}
          >
            <LuCopy className="w-3 h-3" />
          </button>
        )}

        <button
          className="btn btn-ghost btn-xs w-5 h-4 min-h-0 p-0 text-base-content/20 hover:text-error hover:bg-error/10"
          onClick={() => handleBan()}
          title="Забанить"
        >
          <LuUserX className="w-3 h-3" />
        </button>

        {queueType !== QUEUE_TYPES.HISTORY && (
          <button
            className="btn btn-ghost btn-xs w-5 h-4 min-h-0 p-0 text-base-content/20 hover:text-error hover:bg-error/10"
            onClick={() => handleDelete()}
            title="Удалить из очереди"
          >

            <LuTrash2 className="w-3 h-3" />
          </button>
        ) }
      </div>

      {/* Модалка деталей */}
      <QueueElementModal
        onBan={handleBan}
        onClose={closeModal}
        onCopy={handleCopyNickname}
        onDelete={handleDelete}
        player={player}
        queueType={queueType}
        ref={dialogRef}
      />
    </div>
  )
}

export default QueueElement
