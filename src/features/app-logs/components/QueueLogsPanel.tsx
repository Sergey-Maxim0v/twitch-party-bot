import type {FC} from "react";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {useAppLogs} from "../hooks/useAppLogs.ts";
import {APP_LOG_STATUSES} from "../types.ts";

export interface QueueLogsPanelProps {
    className?: string;
    collapsedClassName?: string
}

const QueueLogsPanel: FC<QueueLogsPanelProps> = ({className = "w-80", collapsedClassName = ""}) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_logs_open", true);

    const {logs} = useAppLogs();

    return (
        <CollapsiblePanel
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title="Логи очереди"
            className={className}
            collapsedClassName={collapsedClassName}
        >
            <div className="flex flex-col gap-1 p-4 flex-1 h-0 overflow-x-hidden overflow-y-auto font-mono text-xs">
                {logs.map((el) => (
                    <div key={el.id} className="py-0.5 border-b border-base-content/5 wrap-break-word">
                        <span className="text-base-content/40 select-none">
                            [{new Date(el.timestamp).toLocaleTimeString()}]
                        </span>{" "}
                        <span className="font-bold text-primary">
                            {el.actorUsername}:
                        </span>{" "}
                        <span className={
                            el.status === "success" ? "text-success" :
                                el.status === APP_LOG_STATUSES.ERROR ? "text-error" : "text-base-content"
                        }>
                            {el.message}
                        </span>
                    </div>
                ))}
            </div>
        </CollapsiblePanel>
    );
};

export default QueueLogsPanel;
