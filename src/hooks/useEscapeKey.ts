import { useEffect } from 'react'

/**
 * Вызывает обработчик при нажатии Escape, пока хук активен.
 *
 * @param onEscape - Действие по нажатию Escape.
 * @param enabled - Подписываться ли на событие клавиатуры.
 */
export const useEscapeKey = (onEscape: () => void, enabled = true): void => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, onEscape])
}
