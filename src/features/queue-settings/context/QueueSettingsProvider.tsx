import { type FC, type ReactNode, useEffect, useMemo } from 'react'
import type { QueueSettings } from '../types.ts'
import { DEFAULT_QUEUE_SETTINGS } from '../../../constants/queue.constants.ts'
import { QUEUE_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { QueueSettingsContext } from './QueueSettingsInstance.ts'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { sanitizeQueueSettings } from '../utils/sanitizeQueueSettings.ts'

interface QueueSettingsProviderProps {
  children: ReactNode;
}

/**
 * Провайдер настроек очереди с сохранением в localStorage.
 */
export const QueueSettingsProvider: FC<QueueSettingsProviderProps> = ({ children }) => {
  const [storedSettings, setStoredSettings] = useLocalStorage<QueueSettings>(QUEUE_STORAGE_KEYS.SETTINGS, DEFAULT_QUEUE_SETTINGS)

  const settings = useMemo(() => sanitizeQueueSettings(storedSettings), [storedSettings])

  // Повреждённая конфигурация игры из хранилища заменяется безопасной.
  useEffect(() => {
    if (settings === storedSettings) return

    setStoredSettings(settings)
  }, [settings, storedSettings, setStoredSettings])

  /** Частично обновляет настройки очереди. */
  const updateSettings = (newSettings: Partial<QueueSettings>) => {
    setStoredSettings(prev => sanitizeQueueSettings({ ...prev, ...newSettings }))
  }

  /** Сбрасывает настройки очереди к значениям по умолчанию. */
  const resetSettings = () => {
    setStoredSettings(DEFAULT_QUEUE_SETTINGS)
  }

  return (
    <QueueSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </QueueSettingsContext.Provider>
  )
}
