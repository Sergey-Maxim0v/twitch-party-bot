import {useQueue} from "./useQueue.ts";
import {useTwitchChat} from "../../../services/twitch/hooks/useTwitchChat.ts";
import {useAppLogs} from "../../app-logs/hooks/useAppLogs.ts";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings.ts";

export const useQueueEngine = () => {
    const {messages, registerPendingMessage} = useTwitchChat()
    const {pushLog} = useAppLogs();
    const {settings} = useQueueSettings();
    const {
        activeQueue,
        futureQueue,
        queueHistory,
        clearActiveQueue,
        clearFutureQueue,
        clearQueueHistory,
        addPlayerToQueue,
        removePlayerFromQueue,
        removePlayerFromAllQueues,
        banPlayerFromQueue,
        movePlayer,
        finishActiveQueue
    } = useQueue();

    return {
        clearActiveQueue,
        clearFutureQueue,
        clearQueueHistory,
        addPlayerToQueue,
        removePlayerFromQueue,
        removePlayerFromAllQueues,
        banPlayerFromQueue,
        movePlayer,
        finishActiveQueue
    }
}
