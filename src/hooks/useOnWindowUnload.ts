import { useEffect, useRef } from 'react'

type UnloadCallback = () => void

/**
 * Универсальный хук для выполнения операций при закрытии вкладки,
 * перезагрузке страницы или переходе на другой URL.
 *
 * @param callbacks Функция или массив функций, которые необходимо выполнить.
 */
export const useOnWindowUnload = (callbacks: UnloadCallback | UnloadCallback[]): void => {
  const callbacksRef = useRef<UnloadCallback | UnloadCallback[]>(callbacks)

  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  useEffect(() => {
    const handleUnload = (): void => {
      const currentCallbacks = callbacksRef.current

      if (Array.isArray(currentCallbacks)) {
        currentCallbacks.forEach(callback => callback())
      } else {
        currentCallbacks()
      }
    }

    window.addEventListener('pagehide', handleUnload)

    return () => {
      window.removeEventListener('pagehide', handleUnload)
    }
  }, [])
}
