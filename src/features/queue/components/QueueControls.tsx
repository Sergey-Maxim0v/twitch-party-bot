import {type FC, useCallback} from "react";
import {LOG_INITIATOR} from "../types.ts";
import {useQueue} from "../hooks/useQueue.ts";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings.ts";
import {useAuth} from "../../auth/hooks/useAuth.ts";
import {useAppLogs} from "../../app-logs/hooks/useAppLogs.ts";

export interface QueueControlsProps {
    className?: string;
}

const QueueControls: FC<QueueControlsProps> = ({className = ""}) => {
    const {finishActiveQueue} = useQueue();
    const {settings, updateSettings} = useQueueSettings();
    const {session} = useAuth();
    const {pushLog} = useAppLogs()

    const handleFinishActiveQueue = useCallback(() => {
        finishActiveQueue({initiator: LOG_INITIATOR.STREAMER_UI, actorUsername: session?.login ?? ""})

        if (!settings.allowPreJoin) {
            updateSettings({isQueueOpen: false})
        }
    }, [session?.login, finishActiveQueue, settings.allowPreJoin, updateSettings])

    const handleQueueToggle = useCallback(() => {
        const argsPushLogFnc = {
            message: settings.isQueueOpen ? "Очередь закрыта" : "Очередь открыта",
            initiator: LOG_INITIATOR.STREAMER_UI,
            actorUsername: session?.login ?? ""
        }

        pushLog(argsPushLogFnc)
        updateSettings({isQueueOpen: !settings.isQueueOpen})
    }, [updateSettings, settings.isQueueOpen, session?.login, pushLog])

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <button
                type="button"
                className={`btn btn-block btn-sm shadow-sm font-semibold truncate ${
                    settings.isQueueOpen ? 'btn-error btn-outline' : 'btn-primary'
                }`}
                onClick={handleQueueToggle}
            >
                {settings.isQueueOpen ? 'Закрыть приём заявок' : 'Открыть приём заявок'}
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
