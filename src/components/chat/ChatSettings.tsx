import type {FC} from "react";
import {LuSettings} from 'react-icons/lu';

interface ChatSettingsProps {
    useColoredNames: boolean;
    setUseColoredNames: (value: boolean) => void;
}

const ChatSettings: FC<ChatSettingsProps> = ({
                                                 useColoredNames,
                                                 setUseColoredNames,
                                             }) => {

    return (
        <div className="dropdown dropdown-end">
            <button
                tabIndex={0}
                className="btn btn-ghost btn-sm btn-square"
                aria-label="Настройки чата"
            >
                <LuSettings className="w-5 h-5 text-base-content/70"/>
            </button>
            <ul
                tabIndex={0}
                className="dropdown-content z-[50] menu p-4 shadow bg-base-200 rounded-box w-64 gap-3 mt-1"
            >
                <li className="menu-title px-0 text-xs font-bold uppercase tracking-wider text-base-content/50">
                    Настройки чата
                </li>

                <label className="label cursor-pointer justify-between p-0 field-label">
                    <span className="label-text font-medium">Цветные ники</span>
                    <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={useColoredNames}
                        onChange={(e) => setUseColoredNames(e.target.checked)}
                    />
                </label>
            </ul>
        </div>
    );
};

export default ChatSettings