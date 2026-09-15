import { type FC, useState } from 'react'
import QueueActiveList from './QueueActiveList.tsx'
import QueueFutureList from './QueueFutureList.tsx'
import QueueHistoryList from './QueueHistoryList.tsx'
import QueueControls from './QueueControls.tsx'
import QueueForm from './QueueForm.tsx'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'

const QueuePanel: FC = () => {
  const { settings } = useQueueSettings()
  const [isActiveListOpen, setIsActiveListOpen] = useState<boolean>(true)
  const [isFutureListOpen, setIsFutureListOpen] = useState<boolean>(false)
  const [isHistoryListOpen, setIsHistoryListOpen] = useState<boolean>(false)

  const disabledFuture = !settings?.allowPreJoin

  return (
    <div className="flex flex-col h-full overflow-hidden text-sm text-base-content/80">

      <QueueControls className="shrink-0 p-4 pb-2 bg-transparent relative z-10" />

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
        <QueueActiveList className="w-full" onOpenChange={setIsActiveListOpen} open={isActiveListOpen} />

        <QueueFutureList className="w-full"
          disabled={disabledFuture}
          onOpenChange={setIsFutureListOpen}
          open={isFutureListOpen}
        />
          
        <QueueHistoryList className="w-full" onOpenChange={setIsHistoryListOpen} open={isHistoryListOpen} />
      </div>

      <QueueForm className="shrink-0 p-4 bg-transparent relative z-10" />

    </div>
  )
}

export default QueuePanel
