/**
 * Локаль отображения дат и времени в приложении.
 */
export const APP_LOCALE = 'ru-RU'

/**
 * Форматирует время с точностью до секунд.
 *
 * @param timestamp - Временная метка в миллисекундах.
 * @returns Время в формате ЧЧ:ММ:СС.
 */
export const formatTimeWithSeconds = (timestamp: number): string => (
  new Date(timestamp).toLocaleTimeString(APP_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
)

/**
 * Форматирует время с точностью до минут.
 *
 * @param timestamp - Временная метка в миллисекундах.
 * @returns Время в формате ЧЧ:ММ.
 */
export const formatTime = (timestamp: number): string => (
  new Date(timestamp).toLocaleTimeString(APP_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  })
)

/**
 * Форматирует дату и время по локали приложения.
 *
 * @param timestamp - Временная метка в миллисекундах.
 * @returns Дата и время в локали приложения.
 */
export const formatDateTime = (timestamp: number): string => (
  new Date(timestamp).toLocaleString(APP_LOCALE)
)
