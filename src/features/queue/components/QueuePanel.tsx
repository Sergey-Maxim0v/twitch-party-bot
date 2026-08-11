import type {FC} from "react";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";

export interface QueuePanelProps {
    className?: string;
    collapsedClassName?: string;
}

const QueuePanel: FC<QueuePanelProps> = ({className = "", collapsedClassName = ""}) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_panel_open", true);

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
