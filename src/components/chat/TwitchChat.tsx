import React, {useState} from "react";
import ChatToggle from "./ChatToggle.tsx";
import {useLocalStorage} from "../../hooks";
import ChatInput from "./ChatInput.tsx";
import ChatList from "./ChatList.tsx";

export interface TwitchChatProps {
    className?: string;
}

const ANIMATION_TIME = "300ms";

const TwitchChat = ({className = ""}: TwitchChatProps) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("twitch_chat_open", true);
    const [isAnimationDone, setIsAnimationDone] = useState(isOpen);

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
            <ChatToggle isOpen={isOpen}
                        onOpen={() => {
                            if (isOpen) setIsAnimationDone(false);
                            setIsOpen(!isOpen);
                        }}
            />

            {isOpen && (
                <div
                    className={
                        `flex flex-col h-full w-full pt-14 overflow-hidden
                        transition-opacity duration-[${ANIMATION_TIME}] ease-in-out
                        ${isAnimationDone ? "opacity-100" : "opacity-0"}
                  `}
                >
                    <ChatList/>
                    <ChatInput/>
                </div>
            )}
        </aside>
    );
};

export default TwitchChat;
