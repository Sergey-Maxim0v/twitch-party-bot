import type {FC} from "react";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import {useQueueEngine} from "../hooks/useQueueEngine.ts";
import {useQueue} from "../hooks/useQueue.ts";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings.ts";

export interface QueuePanelProps {
    className?: string;
    collapsedClassName?: string;
}

const QueuePanel: FC<QueuePanelProps> = ({className = "", collapsedClassName = ""}) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_panel_open", true);

    const {activeQueue, futureQueue, queueHistory,} = useQueue();
    const {settings} = useQueueSettings();
    const {} = useQueueEngine();

    return (
        <CollapsiblePanel
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title="Очередь"
            className={className}
            collapsedClassName={collapsedClassName}
        >
            <div className="p-4 text-sm text-base-content/80">
                Queue Panel
            </div>
        </CollapsiblePanel>
    );
}

export default QueuePanel;
