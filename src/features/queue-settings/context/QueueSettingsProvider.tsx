import {type FC, type ReactNode} from 'react';
import {DEFAULT_QUEUE_SETTINGS, type QueueSettings} from '../types.ts';
import {QueueSettingsContext} from "./QueueSettingsInstance";
import {LOCAL_STORAGE_KEY} from "../constants.ts";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";

export const QueueSettingsProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [settings, setSettings] = useLocalStorage<QueueSettings>(LOCAL_STORAGE_KEY, DEFAULT_QUEUE_SETTINGS);

    /**
     *  Функция для частичного обновления настроек
     */
    const updateSettings = (newSettings: Partial<QueueSettings>) => {
        setSettings((prev) => ({
            ...prev,
            ...newSettings,
        }));
    };

    /**
     *  Функция сброса к дефолтным значениям
     */
    const resetSettings = () => {
        setSettings(DEFAULT_QUEUE_SETTINGS);
    };

    return (
        <QueueSettingsContext.Provider value={{settings, updateSettings, resetSettings}}>
            {children}
        </QueueSettingsContext.Provider>
    );
};
