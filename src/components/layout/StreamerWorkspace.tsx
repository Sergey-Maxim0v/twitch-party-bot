import type {FC} from "react";
import QueuePanel from "../queue/QueuePanel.tsx";
import TwitchChat from "../chat/TwitchChat.tsx";
import QueueLogs from "../queue/QueueLogs.tsx";
import QueueSettings from "../queue/QueueSettings.tsx";

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
                <QueueSettings className={PANEL_CLASSNAME}
                               collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
                />

                <QueuePanel className={PANEL_CLASSNAME}
                            collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
                />

                <QueueLogs className={PANEL_CLASSNAME}
                           collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
                />

                <TwitchChat className="h-full shrink-0"/>
            </div>
        </div>
    );
};

export default StreamerWorkspace;

