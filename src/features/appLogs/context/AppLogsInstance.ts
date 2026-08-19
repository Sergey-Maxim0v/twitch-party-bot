import {createContext} from "react";
import type {AppLogItem, AppLogStatus} from "../types.ts";
import type {LogInitiator} from "../../queue/types.ts";

export interface AppLogsContextValue {
    logs: AppLogItem[];
    pushLog: (args: {
        message: string;
        status?: AppLogStatus;
        initiator: LogInitiator;
        actorUsername: string;
        rawCommand?: string;
        extractedGameNickname?: string | null;
    }) => void;
    clearLogs: () => void;
}

export const AppLogsContext = createContext<AppLogsContextValue | null>(null);
