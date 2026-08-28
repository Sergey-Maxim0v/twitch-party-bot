import type { FC } from 'react'

export interface FileCallbackProps {
  className?: string;
}

const QueueAddForm: FC<FileCallbackProps> = ({ className = '' }) => {

  return (
    <div className={className}>
      TODO: QueueAddForm
    </div>
  )
}  

export default QueueAddForm
