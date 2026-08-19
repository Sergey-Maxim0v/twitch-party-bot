import {type FC} from "react";
import {APP_LOG_STATUSES, type AppLogItem} from "../types.ts";

interface QueueLogsElementProps {
    log: AppLogItem;
}

/**
 * Атомарный компонент для отображения одного элемента лога.
 */
export const QueueLogsElement: FC<QueueLogsElementProps> = ({log}) => {
    const timeString = new Date(log.timestamp).toLocaleTimeString();

    let statusClassName = "text-base-content";

    if (log.status === APP_LOG_STATUSES.SUCCESS) {
        statusClassName = "text-success";
    } else if (log.status === APP_LOG_STATUSES.WARNING) {
        statusClassName = "text-warning";
    } else if (log.status === APP_LOG_STATUSES.ERROR) {
        statusClassName = "text-error";
    }

    return (
        <div className="py-0.5 border-b border-base-content/5 wrap-break-word">
            <span className="text-base-content/40 select-none">
                [{timeString}]
            </span>{" "}
            <span className="font-bold text-primary">
                {log.actorUsername}:
            </span>{" "}
            <span className={statusClassName}>
                {log.message}
            </span>
        </div>
    );
};

export default QueueLogsElement;
