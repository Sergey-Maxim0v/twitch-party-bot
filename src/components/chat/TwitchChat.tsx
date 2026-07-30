import React, {useState} from "react";
import ChatToggle from "./ChatToggle.tsx";
import {useLocalStorage} from "../../hooks";
import ChatInput from "./ChatInput.tsx";
import ChatList from "./ChatList.tsx";
import {useTwitchChat} from "../../services/twitch/hooks/useTwitchChat.ts";
import {ColoredNamesToggle} from "./ColoredNamesToggle.tsx";

export interface TwitchChatProps {
    className?: string;
}

const ANIMATION_TIME = "300ms";

const TwitchChat = ({className = ""}: TwitchChatProps) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("twitch_chat_open", true);
    const [isAnimationDone, setIsAnimationDone] = useState(isOpen);
    const [useColoredNames, setUseColoredNames] = useLocalStorage<boolean>("twitch_chat_colored_names", true);

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
            {/* Обертка для элементов управления в шапке панели */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2 z-10">
                <ChatToggle isOpen={isOpen}
                            onOpen={() => {
                                if (isOpen) setIsAnimationDone(false);
                                setIsOpen(!isOpen);
                            }}
                />

                {isOpen && isAnimationDone && (
                    <ColoredNamesToggle
                        checked={useColoredNames}
                        onChange={setUseColoredNames}
                    />
                )}
            </div>

            {isOpen && (
                <div
                    className={
                        `flex flex-col h-full w-full pt-14 overflow-hidden
                        transition-opacity duration-[${ANIMATION_TIME}] ease-in-out
                        ${isAnimationDone ? "opacity-100" : "opacity-0"}
                  `}
                >
                    {/* Передаем настройку в список сообщений */}
                    <ChatList messages={messages} useColoredNames={useColoredNames}/>
                    <ChatInput onSendMessage={registerPendingMessage}/>
                </div>
            )}
        </aside>
    );
};

export default TwitchChat;
