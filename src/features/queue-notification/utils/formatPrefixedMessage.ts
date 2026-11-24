/**
 * Добавляет префикс к тексту автоматического сообщения.
 */
export const formatPrefixedMessage = (text: string, prefix?: string): string => prefix ? `${prefix} ${text}` : text
