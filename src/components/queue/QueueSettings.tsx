import {useLocalStorage} from "../../hooks";
import CollapsiblePanel from "../layout/panel/CollapsiblePanel.tsx";

export interface QueueSettingsProps {
    className?: string;
    collapsedClassName?: string;
}

const QueueSettings = ({className = "", collapsedClassName = ""}: QueueSettingsProps) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_settings_open", true);

    return (
        <CollapsiblePanel
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title="Настройки очереди"
            className={className}
            collapsedClassName={collapsedClassName}
        >
            <div className="p-4 text-sm text-base-content/80">
                Queue Settings
            </div>
        </CollapsiblePanel>
    );
}

export default QueueSettings;
