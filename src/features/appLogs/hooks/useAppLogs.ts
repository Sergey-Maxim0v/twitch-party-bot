import {useContext} from "react";
import {AppLogsContext, type AppLogsContextValue} from "../context/AppLogsInstance.ts";

/**
 * Хук для безопасного доступа к контексту логов приложения (чтение, запись, очистка).
 */
export const useAppLogs = (): AppLogsContextValue => {
    const context = useContext(AppLogsContext);

    if (!context) {
        throw new Error("[AppLogs] useAppLogs должен использоваться строго внутри AppLogsProvider");
    }

    return context;
};
