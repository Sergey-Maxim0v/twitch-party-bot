import { type FC, type ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { QueueCollapse, type QueueListProps } from '../../../components/QueueCollapse.tsx'
import { QueueElement } from './QueueElement.tsx'
import type { MutableQueueType, QueuePlayer } from '../types.ts'

interface QueueDropListProps extends QueueListProps {
  /** Заголовок блока. */
  title: string;
  /** Игроки списка. */
  players: QueuePlayer[];
  /** Очередь, в которой находятся игроки. */
  queueType: MutableQueueType;
  /** Метка в заголовке блока. */
  badge: ReactNode;
  /** CSS-классы подсветки при перетаскивании игрока. */
  highlightClassName: string;
}

/**
 * Список очереди с поддержкой перетаскивания игроков.
 */
export const QueueDropList: FC<QueueDropListProps> = ({
  title,
  players,
  queueType,
  badge,
  highlightClassName,
  className = '',
  onOpenChange,
  open,
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: queueType })
  const playerIds = players.map(player => player.queueEntryId)

  return (
    <QueueCollapse
      badge={badge}
      className={`${className} rounded-xl! shadow-xs`}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
        <div
          className={`flex min-h-10 flex-col gap-1.5 rounded-lg transition-colors duration-200
            ${isOver ? highlightClassName : ''}`}
          ref={setNodeRef}
        >
          {players.map(player => (
            <QueueElement key={player.queueEntryId} player={player} queueType={queueType} />
          ))}
        </div>
      </SortableContext>
    </QueueCollapse>
  )
}
