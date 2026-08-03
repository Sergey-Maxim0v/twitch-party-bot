import {type FC, type ReactNode, useState} from "react";
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
    const [isAnimationDone, setIsAnimationDone] = useState<boolean>(isOpen);

    /**
     * Обработчик клика по кнопке сворачивания.
     */
    const handleToggle = () => {
        if (isOpen) {
            setIsAnimationDone(false);
        }
        onToggle();
    };

    /**
     * Обработчик завершения CSS-перехода.
     */
    const handleTransitionEnd = (e: React.TransitionEvent<HTMLElement>) => {
        if (e.propertyName === "width" && e.target === e.currentTarget) {
            setIsAnimationDone(isOpen);
        }
    };

    return (
        <section
            onTransitionEnd={handleTransitionEnd}
            className={`
                flex flex-col bg-base-200 relative h-full border-r border-base-300 
                transition-all duration-300 ease-in-out
                ${isOpen ? `w-80 ${className}` : `w-12 bg-base-300 ${collapsedClassName}`}
            `}
        >
            <PanelToggle
                isOpen={isOpen}
                onOpen={handleToggle}
                title={title}
            />

            {(isOpen || !isAnimationDone) && (
                <div
                    className={`
                        flex flex-col h-full w-full pt-14 overflow-hidden
                        ${isOpen ? "transition-opacity duration-300 ease-in-out" : "hidden"}
                        ${isOpen && isAnimationDone ? "opacity-100" : "opacity-0"}
                    `}
                >
                    {children}
                </div>
            )}
        </section>
    );
};

export default CollapsiblePanel;
