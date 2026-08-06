import {type FC} from "react";
import CollapsiblePanel from "../layout/panel/CollapsiblePanel.tsx";
import {useLocalStorage} from "../../hooks/useLocalStorage.ts";

export interface QueueLogsProps {
    className?: string;
    collapsedClassName?: string
}

const QueueLogs: FC<QueueLogsProps> = ({className = "w-80", collapsedClassName = ""}: QueueLogsProps) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_logs_open", true);

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
        </CollapsiblePanel>
    );
};

export default QueueLogs;
