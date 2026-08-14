import type {FC} from "react";
import {LuSettings} from 'react-icons/lu';
import ChatSettingsToggle from "./ChatSettingsToggle.tsx";

interface ChatSettingsProps {
    useColoredNames: boolean;
    setUseColoredNames: (value: boolean) => void;
    highlightRoles: boolean;
    setHighlightRoles: (value: boolean) => void;
    IsShowDeletedMessages: boolean;
    setIsShowDeletedMessages: (value: boolean) => void
    showSystemNotifications: boolean;
    setShowSystemNotifications: (value: boolean) => void
    highlightPointsMessages: boolean;
    setHighlightPointsMessages: (value: boolean) => void;
}

const ChatSettings: FC<ChatSettingsProps> = ({
                                                 useColoredNames,
                                                 setUseColoredNames,
                                                 highlightRoles,
                                                 setHighlightRoles,
                                                 setIsShowDeletedMessages,
                                                 IsShowDeletedMessages,
                                                 showSystemNotifications,
                                                 setShowSystemNotifications,
                                                 highlightPointsMessages,
                                                 setHighlightPointsMessages
                                             }) => {

    return (
        <div className="dropdown dropdown-top group">
            <button
                tabIndex={0}
                className="btn btn-ghost btn-sm btn-square"
                aria-label="Настройки чата"
            >
                <LuSettings className="w-5 h-5 text-base-content/70"/>
            </button>
            <div
                tabIndex={0}
                className="dropdown-content pointer-events-none group-focus-within:pointer-events-auto
                z-50 p-4 shadow-2xl bg-base-100 border border-base-300 rounded-box w-72 mb-2
                flex flex-col gap-3 overflow-hidden box-border"
            >
                <div className="text-xs font-bold uppercase tracking-wider
                    text-base-content/50 w-full select-none"
                >
                    Отображение чата
                </div>

                <div className="w-full flex flex-col gap-3">
                    <ChatSettingsToggle
                        label="Цветные ники"
                        checked={useColoredNames}
                        onChange={setUseColoredNames}
                    />

                    <ChatSettingsToggle
                        label="Стили модеров, випов"
                        checked={highlightRoles}
                        onChange={setHighlightRoles}
                    />

                    <ChatSettingsToggle
                        label="Выделенные сообщения"
                        checked={highlightPointsMessages}
                        onChange={setHighlightPointsMessages}
                    />

                    <ChatSettingsToggle
                        label="Показать удаленные сообщения"
                        checked={IsShowDeletedMessages}
                        onChange={setIsShowDeletedMessages}
                    />

                    <ChatSettingsToggle
                        label="Показать системные сообщения"
                        checked={showSystemNotifications}
                        onChange={setShowSystemNotifications}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatSettings