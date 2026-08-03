import {type FC, type ReactNode} from "react";
import PanelToggle from "./PanelToggle.tsx";

export interface CollapsiblePanelProps {
    isOpen: boolean;
    onToggle: () => void;
    title: string;
    children: ReactNode;
    className?: string;
    collapsedClassName?: string;
}

/**
 * * @param className - Стили для раскрытого состояния
 *  * @param collapsedClassName - Стили для свернутого состояния
 */
const CollapsiblePanel: FC<CollapsiblePanelProps> = ({
                                                         isOpen,
                                                         onToggle,
                                                         title,
                                                         children,
                                                         className = "",
                                                         collapsedClassName = ""
                                                     }: CollapsiblePanelProps) => {

    return (
        <section
            className={`
                flex flex-col bg-base-200 relative h-full border-l border-base-300
                ${isOpen ? className : `${collapsedClassName} shrink-0 bg-base-300`}
            `}
        >
            {/* Универсальная кнопка переключения состояния и вертикальный заголовок */}
            <PanelToggle
                isOpen={isOpen}
                onOpen={onToggle}
                title={title}
            />
            
            {isOpen && (
                <div className="flex flex-col h-full w-full pt-14 overflow-hidden">
                    {children}
                </div>
            )}
        </section>
    );
};

export default CollapsiblePanel;
