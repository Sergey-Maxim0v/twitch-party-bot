import type {FC} from "react";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";

export interface QueueLogsPanelProps {
    className?: string;
    collapsedClassName?: string
}

const QueueLogsPanel: FC<QueueLogsPanelProps> = ({className = "w-80", collapsedClassName = ""}) => {
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

export default QueueLogsPanel;
