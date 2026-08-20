import {type FC} from "react";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import QueueActiveList from "./QueueActiveList.tsx";
import QueueFutureList from "./QueueFutureList.tsx";
import QueueHistoryList from "./QueueHistoryList.tsx";
import QueueControls from "./QueueControls.tsx";
import QueueForm from "./QueueForm.tsx";

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
            <div className="flex flex-col h-full overflow-hidden text-sm text-base-content/80">

                <QueueControls className="shrink-0 p-4 pb-2 bg-transparent relative z-10"/>

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
                    <QueueActiveList className="w-full"/>
                    <QueueFutureList className="w-full"/>
                    <QueueHistoryList className="w-full"/>
                </div>

                <QueueForm className="shrink-0 p-4 bg-transparent relative z-10"/>

            </div>
        </CollapsiblePanel>
    );
}

export default QueuePanel;
