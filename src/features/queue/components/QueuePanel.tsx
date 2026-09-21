import { type FC, useState } from 'react'
import { DndContext, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import QueueActiveList from './QueueActiveList.tsx'
import QueueFutureList from './QueueFutureList.tsx'
import QueueHistoryList from './QueueHistoryList.tsx'
import QueueControls from './QueueControls.tsx'
import QueueForm from './QueueForm.tsx'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from '../hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import QueueElement from './QueueElement.tsx'
import { QUEUE_TYPES, type QueuePlayer } from '../types.ts'
import { handleDragEnd } from '../utils/handleDragEnd.ts'

const QueuePanel: FC = () => {
  const { settings } = useQueueSettings()
  const { movePlayer, activeQueue, futureQueue } = useQueue()
  const { userDisplayName } = useAuth()

  const [isActiveListOpen, setIsActiveListOpen] = useState<boolean>(true)
  const [isFutureListOpen, setIsFutureListOpen] = useState<boolean>(settings?.allowPreJoin)
  const [isHistoryListOpen, setIsHistoryListOpen] = useState<boolean>(true)
  const [draggingPlayer, setDraggingPlayer] = useState<QueuePlayer | null>(null)

  const disabledFuture = !settings?.allowPreJoin

  // Настройка сенсоров, чтобы клики по кнопкам внутри карточки не ломали драг
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Драг начнется, только если сдвинуть мышь на 8 пикселей
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent): void => {
    const activeId = event.active.id as string
    const player = activeQueue.find(p => p.userId === activeId) || futureQueue.find(p => p.userId === activeId)
    if (player) {
      setDraggingPlayer(player)
    }
  }

  const onDragEnd = (event: DragEndEvent): void => {
    setDraggingPlayer(null)

    handleDragEnd({
      event,
      activeQueue,
      futureQueue,
      movePlayer,
      userDisplayName,
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden text-sm text-base-content/80">
      <QueueControls className="shrink-0 p-4 pb-2 bg-transparent relative z-10" />

      <DndContext onDragEnd={onDragEnd} onDragStart={handleDragStart} sensors={sensors}>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
          <QueueActiveList className="w-full" onOpenChange={setIsActiveListOpen} open={isActiveListOpen} />

          <QueueFutureList
            className="w-full"
            disabled={disabledFuture}
            onOpenChange={setIsFutureListOpen}
            open={isFutureListOpen}
          />

          <QueueHistoryList className="w-full" onOpenChange={setIsHistoryListOpen} open={isHistoryListOpen} />
        </div>

        {/* Оверлей, который рендерится поверх всех overflow окон */}
        <DragOverlay dropAnimation={null}>
          {draggingPlayer ? (
            <div className="w-[calc(100%-8px)] pointer-events-none strict-dragging-preview">
              <QueueElement
                player={draggingPlayer}
                queueType={activeQueue.some(p => p.userId === draggingPlayer.userId) ? QUEUE_TYPES.ACTIVE : QUEUE_TYPES.FUTURE}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <QueueForm className="shrink-0 p-4 bg-transparent relative z-10" />
    </div>
  )
}

export default QueuePanel
