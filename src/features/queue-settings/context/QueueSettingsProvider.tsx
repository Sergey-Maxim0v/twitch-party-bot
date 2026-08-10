import {type FC, useEffect, useState} from 'react';
import {DEFAULT_QUEUE_SETTINGS, type QueueSettings} from '../types';
import {QueueSettingsContext} from "./QueueSettingsInstance";

const LOCAL_STORAGE_KEY = 'twitch_queue_settings';

export const QueueSettingsProvider: FC<{ children: React.ReactNode }> = ({children}) => {
    const [settings, setSettings] = useState<QueueSettings>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_QUEUE_SETTINGS;
        } catch (error) {
            console.error('Ошибка при загрузке настроек очереди из localStorage:', error);
            return DEFAULT_QUEUE_SETTINGS;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Ошибка при сохранении настроек очереди в localStorage:', error);
        }
    }, [settings]);

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
