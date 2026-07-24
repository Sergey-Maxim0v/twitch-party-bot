import React from "react";
import ChatToggle from "./ChatToggle.tsx";
import {useLocalStorage} from "../../hooks";
import ChatInput from "./ChatInput.tsx";
import ChatList from "./ChatList.tsx";

export interface TwitchChatProps {
    className?: string;
}

const TwitchChat = ({className = ""}: TwitchChatProps) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("twitch_chat_open", true);

    return (
        <aside
            className={`
            flex flex-col bg-base-200 transition-all duration-300 ease-in-out relative
            ${isOpen ? "w-80" : "w-12 bg-base-300"}
            ${className} 
          `}
        >
            <ChatToggle isOpen={isOpen} onOpen={() => setIsOpen(!isOpen)}/>

            {isOpen && (
                <div className="flex flex-col h-full w-full overflow-hidden">
                    <div className="h-14 shrink-0"/>

                    <ChatList/>
                    <ChatInput/>
                </div>
            )}
        </aside>
    );
};

export default TwitchChat;
