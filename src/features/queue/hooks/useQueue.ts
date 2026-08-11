import {useContext} from "react";
import {QueueContext} from "../context/QueueInstance";
import type {QueueContextValue} from "../context/QueueInstance";

/**
 * Хук для доступа к состоянию и методам управления очередью.
 * Должен использоваться строго внутри QueueProvider.
 *
 * @returns {QueueContextValue} Объект с состоянием очереди и методами управления
 * @throws {Error} Если хук вызван вне компонента QueueProvider
 */
export const useQueue = (): QueueContextValue => {
    const context = useContext(QueueContext);

    if (!context) {
        throw new Error("useQueue must be used within a QueueProvider");
    }

    return context;
};
