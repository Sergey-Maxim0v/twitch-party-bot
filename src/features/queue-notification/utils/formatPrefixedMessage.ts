/**
 * Добавляет префикс к тексту автоматического сообщения.
 */
export const formatPrefixedMessage = (text: string, prefix?: string): string => {
  return prefix ? `${prefix} ${text}` : text
}
