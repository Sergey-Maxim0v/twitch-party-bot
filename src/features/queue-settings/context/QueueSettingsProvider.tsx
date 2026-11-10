import { type FC, type ReactNode } from 'react'
import type { QueueSettings } from '../types.ts'
import { DEFAULT_QUEUE_SETTINGS } from '../../../constants/queue.constants.ts'
import { QUEUE_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { QueueSettingsContext } from './QueueSettingsInstance.ts'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'

interface QueueSettingsProviderProps {
  children: ReactNode;
}

/**
 * Провайдер настроек очереди с сохранением в localStorage.
 */
export const QueueSettingsProvider: FC<QueueSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<QueueSettings>(QUEUE_STORAGE_KEYS.SETTINGS, DEFAULT_QUEUE_SETTINGS)

  /** Частично обновляет настройки очереди. */
  const updateSettings = (newSettings: Partial<QueueSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }))
  }

  /** Сбрасывает настройки очереди к значениям по умолчанию. */
  const resetSettings = () => {
    setSettings(DEFAULT_QUEUE_SETTINGS)
  }

  return (
    <QueueSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </QueueSettingsContext.Provider>
  )
}
