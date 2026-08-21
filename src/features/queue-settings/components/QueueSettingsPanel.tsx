import type {FC} from "react";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {QueueCommandsSection} from "./QueueCommandsSection.tsx";
import {QueueBanListSection} from "./QueueBanListSection.tsx";
import {QueueGameSection} from "./QueueGameSection.tsx";
import QueueGeneralSettings from "./QueueGeneralSettings.tsx";

export interface QueueSettingsProps {
    className?: string;
    collapsedClassName?: string;
}

const QueueSettingsPanel: FC<QueueSettingsProps> = ({
                                                        className = "",
                                                        collapsedClassName = ""
                                                    }) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_settings_open", true);

    const titleClassName = "text-xs font-bold tracking-wide text-base-content/50 uppercase"

    // TODO:
    //  - закрывать очередь при перезагрузке страницы
    //  - закрывать очередь при смене канала
    //  - закрывать очередь при разлогине

    return (
        <CollapsiblePanel
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title="Настройки очереди"
            className={className}
            collapsedClassName={collapsedClassName}
        >
            <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar min-w-0">

                <QueueGeneralSettings titleClassName={titleClassName}/>

                <QueueGameSection/>

                <QueueCommandsSection titleClassName={titleClassName}/>

                <QueueBanListSection titleClassName={titleClassName}/>
            </div>
        </CollapsiblePanel>
    );
};

export default QueueSettingsPanel;
