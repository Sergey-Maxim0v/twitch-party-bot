import type {FC} from "react";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {useQueue} from "../hooks/useQueue.ts";

export interface QueueLogsPanelProps {
    className?: string;
    collapsedClassName?: string
}

const QueueLogsPanel: FC<QueueLogsPanelProps> = ({className = "w-80", collapsedClassName = ""}) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_logs_open", true);

    const {queueLogs} = useQueue();

    return (
        <CollapsiblePanel
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title="Логи очереди"
            className={className}
            collapsedClassName={collapsedClassName}
        >
            <div className="p-4 text-sm text-base-content/80">
                Queue Logs
            </div>

            <div className="flex flex-col gap-1 p-4 max-h-96 overflow-y-auto font-mono text-xs">
                {queueLogs.map((el) => (
                    <div key={el.id} className="py-0.5 border-b border-base-content/5">
                        <span className="text-base-content/40">
                            [{new Date(el.timestamp).toLocaleTimeString()}]
                        </span>{" "}
                        <span className="font-bold text-primary">
                            {el.actorUsername}:
                        </span>{" "}
                        <span className={
                            el.status === "success" ? "text-success" :
                                el.status === "rejected" ? "text-error" : "text-base-content"
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
