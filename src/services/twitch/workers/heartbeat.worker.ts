/**
 * @file heartbeat.worker.ts
 * @description Изолированный Web Worker для ведения точных фоновых таймеров.
 */
import {HeartbeatWorkerCommand, HeartbeatWorkerEvent} from "../config.ts";

let pingTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pongTimeoutId: ReturnType<typeof setTimeout> | null = null;

//  Сброс всех активных таймаутов в памяти воркера.
const clearAllTimers = (): void => {
    if (pingTimeoutId) {
        clearTimeout(pingTimeoutId);
        pingTimeoutId = null;
    }
    if (pongTimeoutId) {
        clearTimeout(pongTimeoutId);
        pongTimeoutId = null;
    }
};

self.onmessage = (event: MessageEvent) => {
    const {type, payload} = event.data;

    switch (type) {
        // Инициализация или сброс таймера контроля тишины чата
        case HeartbeatWorkerCommand.START_PING_TIMER: {
            clearAllTimers();

            const interval = payload || 60000;

            pingTimeoutId = setTimeout(() => {
                self.postMessage({type: HeartbeatWorkerEvent.PING_TICK});
            }, interval);
            break;
        }

        // Запуск таймера ожидания ответа PONG от сервера
        case HeartbeatWorkerCommand.START_PONG_TIMER: {
            clearAllTimers();

            const timeout = payload || 10000;

            pongTimeoutId = setTimeout(() => {
                self.postMessage({type: HeartbeatWorkerEvent.PONG_TIMEOUT});
            }, timeout);
            break;
        }

        // Снятие таймера ожидания ответа при успешном получении PONG
        case HeartbeatWorkerCommand.CLEAR_PONG_TIMER: {
            if (pongTimeoutId) {
                clearTimeout(pongTimeoutId);
                pongTimeoutId = null;
            }
            break;
        }

        // Полная остановка всех фоновых таймеров контроля сессии
        case HeartbeatWorkerCommand.CLEAR_ALL: {
            clearAllTimers();
            break;
        }
    }
};
