import type {FC} from "react";
import {useQueue} from "../hooks/useQueue.ts";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings.ts";

export interface QueueHistoryListProps {
    className?: string;
}

const QueueHistoryList: FC<QueueHistoryListProps> = ({className = ""}) => {
    const {queueHistory, clearQueueHistory} = useQueue();
    const {settings} = useQueueSettings();

    return (
        <div className={className}>
            TODO: QueueHistoryList
        </div>
    )
}

export default QueueHistoryList;