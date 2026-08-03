import type {FC} from "react";
import QueuePanel from "../queue/QueuePanel.tsx";
import TwitchChat from "../chat/TwitchChat.tsx";
import QueueLogs from "../queue/QueueLogs.tsx";
import QueueSettings from "../queue/QueueSettings.tsx";

const StreamerWorkspace: FC = () => {
    return (
        <div className="w-full h-full flex justify-center bg-base-300 overflow-hidden">

            <div className="w-full max-w-screen-2xl h-full flex flex-row bg-base-100 overflow-hidden">

                <div className="flex-1 h-full border-r border-base-300 overflow-hidden">
                    <QueueSettings className="h-full w-full"/>
                </div>

                <div className="flex-1 h-full border-r border-base-300 overflow-hidden">
                    <QueuePanel className="h-full w-full"/>
                </div>

                <div className="flex-1 h-full border-r border-base-300 overflow-hidden">
                    <QueueLogs className="h-full w-full"/>
                </div>

                <TwitchChat className="h-full shrink-0"/>
            </div>
        </div>
    );
};

export default StreamerWorkspace;

