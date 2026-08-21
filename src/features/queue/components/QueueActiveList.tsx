import type {FC} from "react";
import {useQueue} from "../hooks/useQueue.ts";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings.ts";

export interface QueueActiveListProps {
    className?: string;
}

const QueueActiveList: FC<QueueActiveListProps> = ({className = ""}) => {
    const {activeQueue, clearActiveQueue} = useQueue();
    const {settings} = useQueueSettings();

    return (
        <div className={className}>
            TODO: QueueActiveList
        </div>
    )
}

export default QueueActiveList;
