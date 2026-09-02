import type { FC } from 'react'
import type { QueuePlayer } from '../types.ts'

export interface QueueElementProps {
  className?: string;
  player: QueuePlayer;
}

const QueueElement:FC<QueueElementProps> = ({ className, player }) => {

  // TODO: нормальный элемент очереди
  //  - с отображением:
  //  время, сообщение в строку, ник твича, игровой ник, роль игрока (модер6 вип)
  //  - с кнопками:
  //  удалить, открыть модалку с подробностями, скопировать ник, забанить

  console.log(player)

  return (
    <div className={className} >
      {JSON.stringify(player)}
    </div>
  )
}

export default QueueElement
