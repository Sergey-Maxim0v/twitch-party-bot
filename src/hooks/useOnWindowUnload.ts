import { useEffect, useRef } from 'react'

type UnloadCallback = () => void

/**
 * Выполняет переданные обработчики при закрытии вкладки,
 * перезагрузке страницы или переходе на другой URL.
 *
 * @param callbacks - Функция или массив функций, которые нужно выполнить.
 */
export const useOnWindowUnload = (callbacks: UnloadCallback | UnloadCallback[]): void => {
  const callbacksRef = useRef<UnloadCallback | UnloadCallback[]>(callbacks)

  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  useEffect(() => {
    const handleUnload = (): void => {
      const currentCallbacks = callbacksRef.current

      if (!Array.isArray(currentCallbacks)) {
        currentCallbacks()
        return
      }

      currentCallbacks.forEach(callback => callback())
    }

    window.addEventListener('pagehide', handleUnload)

    return () => {
      window.removeEventListener('pagehide', handleUnload)
    }
  }, [])
}
