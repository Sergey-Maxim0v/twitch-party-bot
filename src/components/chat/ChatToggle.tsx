import React from "react";
import {LuArrowLeftFromLine} from "react-icons/lu";

interface ChatToggleProps {
    isOpen: boolean;
    onOpen: () => void;
}

const ChatToggle = ({isOpen, onOpen}: ChatToggleProps) => {
    return (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-center">
            <button
                onClick={onOpen}
                className="btn btn-md btn-ghost btn-square"
                title={isOpen ? "Скрыть чат" : "Открыть чат"}
                type="button"
            >
                <LuArrowLeftFromLine
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "-scale-x-100" : ""}`}
                />
            </button>

            {!isOpen && (
                <span
                    className="p-2 text-xs font-bold text-base-content/40 tracking-widest uppercase [writing-mode:vertical-lr] mt-4 select-none">
                  Чат
                </span>
            )}
        </div>
    );
};

export default ChatToggle;
