import type {FC} from "react";

interface ChatSettingsToggleProps {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

const ChatSettingsToggle: FC<ChatSettingsToggleProps> = ({
                                                             label,
                                                             checked,
                                                             onChange,
                                                         }) => {

    return (
        <label className="cursor-pointer flex items-center justify-between gap-x-4 w-full select-none pr-1">
                <span className="label-text font-medium text-base-content/80 break-words leading-tight flex-1 min-w-0">
                    {label}
                </span>
            <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm shrink-0"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </label>
    );
};

export default ChatSettingsToggle;
