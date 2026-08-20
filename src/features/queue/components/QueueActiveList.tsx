import type {FC} from "react";
import {useQueue} from "../hooks/useQueue.ts";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings.ts";
import {TWITCH_STORAGE_KEYS} from "../../auth/config.ts";

export interface QueueActiveListProps {
    className?: string;
}

const QueueActiveList: FC<QueueActiveListProps> = ({className = ""}) => {
    const {activeQueue, clearActiveQueue} = useQueue();
    const {settings} = useQueueSettings();

    const storedChannel = localStorage.getItem(TWITCH_STORAGE_KEYS.ACTIVE_CHANNEL);

    return (
        <div className={className}>
            TODO: QueueActiveList
        </div>
    )
}

export default QueueActiveList;
