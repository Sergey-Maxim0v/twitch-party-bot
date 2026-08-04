import {type FC} from "react";
import {LuArrowLeftFromLine} from "react-icons/lu";

interface PanelToggleProps {
    isOpen: boolean;
    onOpen: () => void;
    title: string;
    className?: string;
}

const PanelToggle: FC<PanelToggleProps> = ({
                                               isOpen,
                                               onOpen,
                                               title,
                                               className = ""
                                           }: PanelToggleProps) => {
    return (
        <button
            onClick={onOpen}
            className={`btn btn-sm btn-ghost btn-square transition-colors ${className}`}
            title={isOpen ? `Скрыть ${title.toLowerCase()}` : `Открыть ${title.toLowerCase()}`}
            type="button"
        >
            <LuArrowLeftFromLine
                className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "-scale-x-100" : ""}`}
            />
        </button>
    );
};

export default PanelToggle;
