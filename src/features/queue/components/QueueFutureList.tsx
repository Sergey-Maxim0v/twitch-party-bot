import type {FC} from "react";
import {useQueue} from "../hooks/useQueue.ts";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings.ts";

export interface QueueFutureListProps {
    className?: string;
}

const QueueFutureList: FC<QueueFutureListProps> = ({className = ""}) => {
    const {futureQueue, clearFutureQueue} = useQueue();
    const {settings} = useQueueSettings();

    return (
        <div className={className}>
            TODO: QueueFutureList
        </div>
    )
}

export default QueueFutureList;