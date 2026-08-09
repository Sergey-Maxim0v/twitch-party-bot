/**
 * Вычисляет задержку для очередной попытки автоматического переподключения.
 * @param {number} attempt - Порядковый номер текущей попытки.
 * @returns {number} Время задержки в миллисекундах для передачи в setTimeout.
 */
export const getReconnectDelay = (attempt: number): number => {
    if (attempt <= 0) return 2000;

    const baseDelay = 2000;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.floor(Math.random() * 500);
    const maxDelay = 30000;

    return Math.min(exponentialDelay + jitter, maxDelay);
};
