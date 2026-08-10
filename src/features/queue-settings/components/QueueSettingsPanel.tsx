import type {FC} from "react";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {GeneralSettingsSection} from "./GeneralSettingsSection.tsx";

export interface QueueSettingsProps {
    className?: string;
    collapsedClassName?: string;
}

const QueueSettingsPanel: FC<QueueSettingsProps> = ({
                                                        className = "",
                                                        collapsedClassName = ""
                                                    }) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_settings_open", true);

    return (
        <CollapsiblePanel
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title="Настройки очереди"
            className={className}
            collapsedClassName={collapsedClassName}
        >
            <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar min-w-0">
                <GeneralSettingsSection/>
                {/* Другие группы будут здесь */}
            </div>
        </CollapsiblePanel>
    );
};

export default QueueSettingsPanel;
