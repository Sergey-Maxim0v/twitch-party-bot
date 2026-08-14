import type {FC} from "react";
import QueueSettingsPanel from "../../features/queue-settings/components/QueueSettingsPanel.tsx";
import {QueueSettingsProvider} from "../../features/queue-settings/context/QueueSettingsProvider.tsx";
import {QueueProvider} from "../../features/queue/context/QueueProvider.tsx";
import QueuePanel from "../../features/queue/components/QueuePanel.tsx";
import QueueLogsPanel from "../../features/queue/components/QueueLogsPanel.tsx";
import TwitchChat from "../../services/twitch/components/TwitchChat.tsx";

const StreamerWorkspace: FC = () => {
    const PANEL_CLASSNAME = 'h-full flex-1 w-83';
    const PANEL_CLASSNAME_COLLAPSED = 'w-12';

    return (
        <div className="w-screen h-full flex justify-center
        bg-base-300 overflow-hidden"
        >
            <div className="w-full h-full flex flex-row bg-base-100
            overflow-hidden"
            >
                <QueueSettingsProvider>
                    <QueueSettingsPanel className={PANEL_CLASSNAME}
                                        collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
                    />
                    <QueueProvider>
                        <QueuePanel className={PANEL_CLASSNAME}
                                    collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
                        />

                        <QueueLogsPanel className={PANEL_CLASSNAME}
                                        collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
                        />
                    </QueueProvider>
                </QueueSettingsProvider>

                <TwitchChat className={PANEL_CLASSNAME}
                            collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
                />
            </div>
        </div>
    );
};

export default StreamerWorkspace;

