import {type FC, useEffect} from "react";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {QueueCommandsSection} from "./QueueCommandsSection.tsx";
import {QueueBanListSection} from "./QueueBanListSection.tsx";
import {QueueGameSection} from "./QueueGameSection.tsx";
import QueueGeneralSettings from "./QueueGeneralSettings.tsx";
import {useQueueSettings} from "../hooks/useQueueSettings.ts";
import {useAuth} from "../../auth/hooks/useAuth.ts";
import {useAppLogs} from "../../app-logs/hooks/useAppLogs.ts";
import {LOG_INITIATOR} from "../../queue/types.ts";

export interface QueueSettingsProps {
    className?: string;
    collapsedClassName?: string;
}

const QueueSettingsPanel: FC<QueueSettingsProps> = ({
                                                        className = "",
                                                        collapsedClassName = ""
                                                    }) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_settings_open", true);

    const {session, activeChannel} = useAuth();
    const {pushLog} = useAppLogs();
    const {settings, updateSettings} = useQueueSettings();


    // TODO:
    //  - посмотреть хук, убрать предупреждение зависимостей и двойной вызов при перезагрузке страницы

    useEffect(() => {
        if (!settings.isQueueOpen) return

        updateSettings({isQueueOpen: false})
        pushLog({
            message: "Очередь закрыта",
            initiator: LOG_INITIATOR.STREAMER_UI,
            actorUsername: session?.login ?? ""
        })
    }, [session?.login, activeChannel]);

    const titleClassName = "text-xs font-bold tracking-wide text-base-content/50 uppercase"

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
