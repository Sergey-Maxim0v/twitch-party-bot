import {type FC, useCallback} from "react";
import {LOG_ACTOR_ROLE, LOG_INITIATOR} from "../types.ts";
import {useQueue} from "../hooks/useQueue.ts";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings.ts";
import {useAuth} from "../../auth/hooks/useAuth.ts";

export interface QueueControlsProps {
    className?: string;
}

const QueueControls: FC<QueueControlsProps> = ({className = ""}) => {
    const {clearActiveQueue, clearFutureQueue, clearQueueHistory, finishActiveQueue} = useQueue();
    const {settings, updateSettings} = useQueueSettings();
    const {session} = useAuth();

    const handleClearAllQueue = useCallback(() => {
        const clearArgs = {
            initiator: LOG_INITIATOR.STREAMER_UI,
            actorUsername: session?.login ?? "",
            actorRole: LOG_ACTOR_ROLE.APPLICATION
        }
        clearActiveQueue(clearArgs)
        clearFutureQueue(clearArgs)
        clearQueueHistory(clearArgs)
    }, [session?.login, clearActiveQueue, clearFutureQueue, clearQueueHistory])

    const handleFinishActiveQueue = useCallback(() => {
        finishActiveQueue({initiator: LOG_INITIATOR.STREAMER_UI, actorUsername: session?.login ?? ""})

        if (!settings.allowPreJoin) {
            updateSettings({isQueueOpen: false})
        }
    }, [session?.login, finishActiveQueue, settings.allowPreJoin, updateSettings])

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <button
                type="button"
                className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
                onClick={handleClearAllQueue}
            >
                Очистить все очереди
            </button>

            <button
                type="button"
                className="btn btn-block btn-primary btn-outline btn-sm shadow-sm font-semibold truncate"
                onClick={handleFinishActiveQueue}
            >
                Завершить текущую очередь
            </button>
        </div>
    )
}

export default QueueControls;
