import {useState, useRef, useEffect, type ReactNode} from "react";
import {LuSend} from "react-icons/lu";
import {useSocketContext} from "../../services/socket/hooks/./useSocketContext.ts";
import * as React from "react";
import {TWITCH_CHAT_MAX_LENGTH, TWITCH_CHAT_MIN_LENGTH} from "../../constants/twitch.constants.ts";
import {CHAT_ACCESS_STATUSES} from "../../services/socket/types";

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    actions?: ReactNode;
}

const STATUS_BUTTON_CLASSES: Record<string, string> = {
    [CHAT_ACCESS_STATUSES.CONNECTED]: "btn-primary",
    [CHAT_ACCESS_STATUSES.RESTRICTED]: "btn-warning text-black",
    [CHAT_ACCESS_STATUSES.OFFLINE]: "btn-error text-white",
    [CHAT_ACCESS_STATUSES.BANNED]: "btn-neutral"
};

const ChatInput = ({onSendMessage, actions}: ChatInputProps) => {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isOverflowed, setIsOverflowed] = useState(false);

    const socketContext = useSocketContext();

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        if (!value.trim()) {
            textarea.style.height = "2rem"; // 32px
            return;
        }

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setValue(text);

        const textarea = textareaRef.current;
        if (!textarea) return;

        if (!text.trim()) {
            setIsOverflowed(false);
        } else {
            const currentHeight = textarea.scrollHeight;
            setIsOverflowed(currentHeight > 128);
        }
    };

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        if (socketContext && socketContext.sendMessage) {
            onSendMessage(trimmedValue);
            socketContext.sendMessage(trimmedValue);
        }

        setValue("");
        setIsOverflowed(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.SubmitEvent);
        }
    };

    const currentStatus = socketContext?.chatAccessStatus || CHAT_ACCESS_STATUSES.OFFLINE;
    const buttonStatusClass = STATUS_BUTTON_CLASSES[currentStatus] || "btn-primary";

    return (
        <div className="p-3 border-t border-base-300 bg-base-200 shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                <textarea
                    ref={textareaRef}
                    name="chat-message"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Отправить сообщение"
                    maxLength={TWITCH_CHAT_MAX_LENGTH}
                    minLength={TWITCH_CHAT_MIN_LENGTH}
                    rows={1}
                    className={`textarea textarea-bordered textarea-sm w-full bg-base-100 text-sm 
                    focus:outline-none placeholder-base-content/40 resize-none 
                    min-h-8 max-h-32 py-1.5 leading-relaxed custom-scrollbar 
                    ${isOverflowed ? "overflow-y-auto" : "overflow-hidden"}`}
                />

                <div className="flex justify-between items-center w-full">
                    {actions}

                    <button
                        type="submit"
                        disabled={!value.trim()}
                        className={`btn btn-sm btn-square transition-colors duration-200 ${buttonStatusClass}`}
                        title="Отправить"
                    >
                        <LuSend className="w-4 h-4"/>
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ChatInput;
