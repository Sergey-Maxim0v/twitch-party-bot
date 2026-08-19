import {type FC, type ReactNode, useState, useCallback, useMemo} from "react";
import {AppLogsContext} from "./AppLogsInstance.ts";
import {APP_LOG_STATUSES, type AppLogItem, type AppLogStatus} from "../types.ts";
import type {LogInitiator} from "../../queue/types.ts";
import {AppLogsConsumerWrapper} from "../components/AppLogsConsumerWrapper.tsx";

interface AppLogsProviderProps {
    children: ReactNode;
}

export const AppLogsProvider: FC<AppLogsProviderProps> = ({children}) => {
    const [logs, setLogs] = useState<AppLogItem[]>([]);

    const pushLog = useCallback(({
                                     message,
                                     status = APP_LOG_STATUSES.INFO,
                                     initiator,
                                     actorUsername,
                                     rawCommand,
                                     extractedGameNickname = null
                                 }: {
        message: string;
        status?: AppLogStatus;
        initiator: LogInitiator;
        actorUsername: string;
        rawCommand?: string;
        extractedGameNickname?: string | null;
    }) => {
        const newLog: AppLogItem = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: Date.now(),
            initiator,
            actorUsername,
            rawCommand,
            message,
            status,
            extractedGameNickname
        };
        setLogs(prev => [newLog, ...prev].slice(0, 200));
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    const value = useMemo(() => ({logs, pushLog, clearLogs}), [logs, pushLog, clearLogs]);

    return (
        <AppLogsContext.Provider value={value}>
            <AppLogsConsumerWrapper>
                {children}
            </AppLogsConsumerWrapper>
        </AppLogsContext.Provider>
    );
};
