import {type FC, type ReactNode} from "react";
import {useAppLogsObserver} from "../hooks/useAppLogsObserver.ts";

interface AppLogsConsumerWrapperProps {
    children: ReactNode;
}

/**
 * Промежуточный компонент, гарантирующий легитимный доступ хука-обсервера
 * к уже инициализированному выше по дереву контексту AppLogsContext.
 */
export const AppLogsConsumerWrapper: FC<AppLogsConsumerWrapperProps> = ({children}) => {
    useAppLogsObserver();

    return children;
};
