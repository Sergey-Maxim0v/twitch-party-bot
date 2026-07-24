import React, {useState, useRef, useEffect} from "react";
import {LuSend} from "react-icons/lu";
import {TWITCH_CHAT_MAX_LENGTH, TWITCH_CHAT_MIN_LENGTH} from "../../constants";

const ChatInput = () => {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isOverflowed, setIsOverflowed] = useState(false);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        const currentScrollHeight = textarea.scrollHeight;
        textarea.style.height = `${currentScrollHeight}px`;

        setIsOverflowed(currentScrollHeight > 128);
    }, [value]);

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!value.trim()) return;

        console.log("Отправка в чат Twitch:", value);
        setValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.SubmitEvent);
        }
    };

    return (
        <div className="p-3 border-t border-base-300 bg-base-200 shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
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

                <div className="flex justify-end w-full">
                    <button
                        type="submit"
                        disabled={!value.trim()}
                        className="btn btn-sm btn-primary btn-square"
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
