import {type FC} from "react";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import QueueLogsElement from "../../app-logs/components/QueueLogsElement.tsx";
import {useAppLogs} from "../hooks/useAppLogs.ts";

interface QueueLogsPanelProps {
    className?: string;
    collapsedClassName?: string;
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
            <div
                className="flex flex-col-reverse justify-start gap-1 p-4 mb-10 flex-1 h-0 overflow-x-hidden overflow-y-auto
                font-mono text-xs shadow-[0_4px_4px_-4px]"
            >
                {logs.map((log) => (
                    <QueueLogsElement key={log.id} log={log}/>
                ))}
            </div>
        </CollapsiblePanel>
    );
};

export default QueueLogsPanel;
