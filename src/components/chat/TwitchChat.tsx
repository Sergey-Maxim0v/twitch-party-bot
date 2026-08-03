import React, {type FC, useState} from "react";
import ChatToggle from "./ChatToggle.tsx";
import {useLocalStorage} from "../../hooks";
import ChatInput from "./ChatInput.tsx";
import ChatList from "./ChatList.tsx";
import {useTwitchChat} from "../../services/twitch/hooks/useTwitchChat.ts";
import ChatSettings from "./ChatSettings.tsx";

export interface TwitchChatProps {
    className?: string;
}

const ANIMATION_TIME = "300ms";

const TwitchChat: FC<TwitchChatProps> = ({className = ""}) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("twitch_chat_open", true);
    const [isAnimationDone, setIsAnimationDone] = useState(isOpen);
    const [useColoredNames, setUseColoredNames] = useLocalStorage<boolean>("twitch_chat_colored_names", true);
    const [highlightRoles, setHighlightRoles] = useLocalStorage<boolean>("twitch_chat_highlight_roles", true);
    const [IsShowDeletedMessages, setIsShowDeletedMessages] = useLocalStorage<boolean>("twitch_chat_show_moderation_logs", true);
    const [showSystemNotifications, setShowSystemNotifications] = useLocalStorage<boolean>("twitch_chat_show_system_notifications", true);

    const {messages, registerPendingMessage} = useTwitchChat();

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLElement>) => {
        if (e.propertyName === "width" && e.target === e.currentTarget) {
            setIsAnimationDone(isOpen);
        }
    };

    return (
        <aside
            onTransitionEnd={handleTransitionEnd}
            className={`
            flex flex-col bg-base-200 transition-all duration-[${ANIMATION_TIME}] ease-in-out relative
            ${isOpen ? "w-80" : "w-12 bg-base-300"}
            ${className} 
          `}
        >
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2 z-10">
                <ChatToggle isOpen={isOpen}
                            onOpen={() => {
                                if (isOpen) setIsAnimationDone(false);
                                setIsOpen(!isOpen);
                            }}
                />
            </div>

            {isOpen && (
                <div
                    className={
                        `flex flex-col h-full w-full pt-14 overflow-hidden
                        transition-opacity duration-[${ANIMATION_TIME}] ease-in-out
                        ${isAnimationDone ? "opacity-100" : "opacity-0"}
                  `}
                >
                    <ChatList
                        messages={messages}
                        useColoredNames={useColoredNames}
                        highlightRoles={highlightRoles}
                        IsShowDeletedMessages={IsShowDeletedMessages}
                        showSystemNotifications={showSystemNotifications}
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
                            />
                        }
                    />
                </div>
            )}
        </aside>
    );
};

export default TwitchChat;
