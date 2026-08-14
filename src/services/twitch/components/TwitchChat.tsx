import {type FC} from "react";
import ChatInput from "./ChatInput.tsx";
import ChatList from "./ChatList.tsx";
import {useTwitchChat} from "../hooks/useTwitchChat.ts";
import ChatSettings from "./ChatSettings.tsx";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";

export interface TwitchChatProps {
    className?: string;
    collapsedClassName?: string;
}

const TwitchChat: FC<TwitchChatProps> = ({className = "", collapsedClassName}) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("twitch_chat_open", true);
    const [useColoredNames, setUseColoredNames] = useLocalStorage<boolean>("twitch_chat_colored_names", true);
    const [highlightRoles, setHighlightRoles] = useLocalStorage<boolean>("twitch_chat_highlight_roles", true);
    const [IsShowDeletedMessages, setIsShowDeletedMessages] = useLocalStorage<boolean>("twitch_chat_show_moderation_logs", true);
    const [showSystemNotifications, setShowSystemNotifications] = useLocalStorage<boolean>("twitch_chat_show_system_notifications", true);
    const [highlightPointsMessages, setHighlightPointsMessages] = useLocalStorage<boolean>("twitch_chat_highlight_messages", true);

    const {messages, registerPendingMessage} = useTwitchChat();

    return (
        <CollapsiblePanel
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title="Чат трансляции"
            className={className}
            collapsedClassName={collapsedClassName}
        >
            <ChatList
                messages={messages}
                useColoredNames={useColoredNames}
                highlightRoles={highlightRoles}
                IsShowDeletedMessages={IsShowDeletedMessages}
                showSystemNotifications={showSystemNotifications}
                highlightPointsMessages={highlightPointsMessages}
            />

            <ChatInput
                onSendMessage={registerPendingMessage}
                actions={
                    <ChatSettings
                        useColoredNames={useColoredNames}
                        setUseColoredNames={setUseColoredNames}
                        highlightRoles={highlightRoles}
                        setHighlightRoles={setHighlightRoles}
                        IsShowDeletedMessages={IsShowDeletedMessages}
                        setIsShowDeletedMessages={setIsShowDeletedMessages}
                        showSystemNotifications={showSystemNotifications}
                        setShowSystemNotifications={setShowSystemNotifications}
                        highlightPointsMessages={highlightPointsMessages}
                        setHighlightPointsMessages={setHighlightPointsMessages}
                    />
                }
            />
        </CollapsiblePanel>
    );
};

export default TwitchChat;
