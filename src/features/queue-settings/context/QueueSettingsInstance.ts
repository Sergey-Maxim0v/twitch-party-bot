import {createContext} from 'react';
import type {QueueSettings} from "../types.ts";

export interface QueueSettingsContextType {
    settings: QueueSettings;
    updateSettings: (newSettings: Partial<QueueSettings>) => void;
    resetSettings: () => void;
}

export const QueueSettingsContext = createContext<QueueSettingsContextType | undefined>(undefined);
