import CollapsiblePanel from "../layout/panel/CollapsiblePanel.tsx";
import {useLocalStorage} from "../../hooks";

export interface QueuePanelProps {
    className?: string;
    collapsedClassName?: string;
}

const QueuePanel = ({className = "", collapsedClassName = ""}: QueuePanelProps) => {
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
