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
        <div className={`absolute top-2 right-2 z-10 flex flex-col items-center ${className}`}>
            <button
                onClick={onOpen}
                className="btn btn-sm btn-ghost btn-square"
                title={isOpen ? `Скрыть ${title.toLowerCase()}` : `Открыть ${title.toLowerCase()}`}
                type="button"
            >
                <LuArrowLeftFromLine
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "-scale-x-100" : ""}`}
                />
            </button>

            {/* Вертикальный текст в свернутом состоянии панели */}
            {!isOpen && (
                <span
                    className="p-2 text-xs font-bold text-base-content/40 tracking-widest uppercase [writing-mode:vertical-lr] mt-4 select-none"
                >
                    {title}
                </span>
            )}
        </div>
    );
};

export default PanelToggle;
