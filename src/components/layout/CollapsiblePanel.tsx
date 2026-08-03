import {type FC, type ReactNode} from "react";

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
                                                         children,
                                                         className = "",
                                                         collapsedClassName = ""
                                                     }: CollapsiblePanelProps) => {

    return (
        <section
            className={`
                flex
                ${isOpen ? className : `${collapsedClassName}`}
            `}
        >
            {children}
        </section>
    );
};

export default CollapsiblePanel;
