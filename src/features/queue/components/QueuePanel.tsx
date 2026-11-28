import { type FC, useState } from 'react'
import { DndContext, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { QueueActiveList } from './QueueActiveList.tsx'
import { QueueWaitingList } from './QueueWaitingList.tsx'
import { QueueHistoryList } from './QueueHistoryList.tsx'
import { QueueControls } from './QueueControls.tsx'
import { QueueForm } from './QueueForm.tsx'
import { useQueue } from '../hooks/useQueue.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { QueueElement } from './QueueElement.tsx'
import type { QueueEntry } from '../types.ts'
import { handleDragEnd } from '../utils/handleDragEnd.ts'
import { findQueueEntry } from '../utils/queuePlayers.utils.ts'
import { useChatCommands } from '../hooks/useChatCommands.ts'

/**
 * Главная панель очереди: списки участников, Drag-and-Drop и форма добавления.
 */
export const QueuePanel: FC = () => {
  const { movePlayer, activeQueue, waitingQueue } = useQueue()
  const actorUsername = useActorUsername()

  useChatCommands()

  const [isActiveListOpen, setIsActiveListOpen] = useState<boolean>(true)
  const [isWaitingListOpen, setIsWaitingListOpen] = useState<boolean>(true)
  const [isHistoryListOpen, setIsHistoryListOpen] = useState<boolean>(true)
  const [draggingEntry, setDraggingEntry] = useState<QueueEntry | null>(null)

  // Клики по кнопкам внутри карточки не должны начинать перетаскивание.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Драг начнется, только если сдвинуть мышь на 8 пикселей
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent): void => {
    const entry = findQueueEntry(activeQueue, waitingQueue, event.active.id as string)
    if (entry) setDraggingEntry(entry)
  }

  const onDragEnd = (event: DragEndEvent): void => {
    if (!draggingEntry) return

    handleDragEnd({
      event,
      activeQueue,
      waitingQueue,
      movePlayer,
      actorUsername,
    })

    setDraggingEntry(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden text-sm text-base-content/80">
      <QueueControls className="relative z-10 shrink-0 border-b border-base-300/70 bg-base-100/40 px-3 py-3 backdrop-blur-md" />

      <DndContext onDragEnd={onDragEnd} onDragStart={handleDragStart} sensors={sensors}>
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain p-3
            scrollbar-thin"
        >
          <QueueActiveList className="w-full" onOpenChange={setIsActiveListOpen} open={isActiveListOpen} />

          <QueueWaitingList
            className="w-full"
            onOpenChange={setIsWaitingListOpen}
            open={isWaitingListOpen}
          />

          <QueueHistoryList className="w-full" onOpenChange={setIsHistoryListOpen} open={isHistoryListOpen} />
        </div>

        {/* Оверлей поверх всех overflow-контейнеров */}
        <DragOverlay dropAnimation={null}>
          {draggingEntry ? (
            <div className="pointer-events-none w-[calc(100%-8px)] rotate-2 opacity-95 drop-shadow-2xl">
              <QueueElement player={draggingEntry.player} queueType={draggingEntry.queueType} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <QueueForm className="relative z-10 shrink-0 border-t border-base-300/70 bg-base-100/40 px-3 py-3 backdrop-blur-md" />
    </div>
  )
}
