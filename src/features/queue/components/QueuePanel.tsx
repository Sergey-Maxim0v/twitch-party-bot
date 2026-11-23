import { type FC, useState } from 'react'
import { DndContext, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { QueueActiveList } from './QueueActiveList.tsx'
import { QueueWaitingList } from './QueueWaitingList.tsx'
import { QueueHistoryList } from './QueueHistoryList.tsx'
import { QueueControls } from './QueueControls.tsx'
import { QueueForm } from './QueueForm.tsx'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from '../hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { APP_LOG_FALLBACK_ACTOR } from '../../../constants/app-logs.constants.ts'
import { QueueElement } from './QueueElement.tsx'
import type { QueueEntry } from '../types.ts'
import { handleDragEnd } from '../utils/handleDragEnd.ts'
import { findQueueEntry } from '../utils/findQueueEntry.ts'
import { useChatCommands } from '../hooks/useChatCommands.ts'

/**
 * Главная панель очереди: списки участников, Drag-and-Drop и форма добавления.
 */
export const QueuePanel: FC = () => {
  const { settings } = useQueueSettings()
  const { movePlayer, activeQueue, waitingQueue } = useQueue()
  const { userDisplayName, session } = useAuth()

  useChatCommands()

  const [isActiveListOpen, setIsActiveListOpen] = useState<boolean>(true)
  const [isWaitingListOpen, setIsWaitingListOpen] = useState<boolean>(settings?.allowPreJoin)
  const [isHistoryListOpen, setIsHistoryListOpen] = useState<boolean>(true)
  const [draggingEntry, setDraggingEntry] = useState<QueueEntry | null>(null)

  const disabledWaiting = !settings?.allowPreJoin

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
      actorUsername: userDisplayName ?? session?.login ?? APP_LOG_FALLBACK_ACTOR,
    })

    setDraggingEntry(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden text-sm text-base-content/80">
      <QueueControls className="relative z-10 shrink-0 border-b border-base-300/70 bg-base-100/40 px-3 py-3 backdrop-blur-md" />

      <DndContext onDragEnd={onDragEnd} onDragStart={handleDragStart} sensors={sensors}>
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain p-3
            [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-base-content/15 [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar]:w-1.5"
        >
          <QueueActiveList className="w-full" onOpenChange={setIsActiveListOpen} open={isActiveListOpen} />

          <QueueWaitingList
            className="w-full"
            disabled={disabledWaiting}
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
