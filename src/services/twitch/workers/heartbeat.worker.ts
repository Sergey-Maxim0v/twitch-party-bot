/**
 * @file heartbeat.worker.ts
 * @description Изолированный Web Worker для ведения точных фоновых таймеров.
 * Защищает логику Heartbeat (Ping/Pong) от жесткого троттлинга (замедления) таймеров
 * со стороны современных браузеров в неактивных или свернутых вкладках.
 */
import {HeartbeatWorkerCommand, HeartbeatWorkerEvent} from "../config.ts";

let pingTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pongTimeoutId: ReturnType<typeof setTimeout> | null = null;

self.onmessage = (event: MessageEvent) => {
    const {type, payload} = event.data;

    switch (type) {
        // Инициализация или сброс таймера контроля тишины чата
        case HeartbeatWorkerCommand.START_PING_TIMER: {
            if (pingTimeoutId) clearTimeout(pingTimeoutId);

            const interval = payload || 60000;
            pingTimeoutId = setTimeout(() => {
                self.postMessage({type: HeartbeatWorkerEvent.PING_TICK});
            }, interval);
            break;
        }

        // Запуск таймера жесткого ожидания ответа PONG от сервера
        case HeartbeatWorkerCommand.START_PONG_TIMER: {
            if (pongTimeoutId) clearTimeout(pongTimeoutId);

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

        // Полная принудительная остановка всех фоновых таймеров контроля сессии
        case HeartbeatWorkerCommand.CLEAR_ALL: {
            if (pingTimeoutId) {
                clearTimeout(pingTimeoutId);
                pingTimeoutId = null;
            }
            if (pongTimeoutId) {
                clearTimeout(pongTimeoutId);
                pongTimeoutId = null;
            }
            break;
        }
    }
};
