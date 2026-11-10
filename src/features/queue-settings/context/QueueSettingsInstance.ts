import { createContext } from 'react'
import type { QueueSettings } from '../types.ts'

/** Значение контекста настроек очереди. */
interface QueueSettingsContextType {
  settings: QueueSettings;
  updateSettings: (newSettings: Partial<QueueSettings>) => void;
  resetSettings: () => void;
}

/** Контекст настроек очереди. */
export const QueueSettingsContext = createContext<QueueSettingsContextType | undefined>(undefined)
