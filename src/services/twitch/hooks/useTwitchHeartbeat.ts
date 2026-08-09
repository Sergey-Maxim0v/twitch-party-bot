import {useEffect, useRef, useCallback} from "react";
import {useSocketContext} from "../../socket/hooks/useSocketContext.ts";
import {CONNECTION_STATUSES} from "../../socket/types";
import {HeartbeatWorkerCommand, HeartbeatWorkerEvent, TwitchIrcCommand} from "../config.ts";

import HeartbeatWorker from "../workers/heartbeat.worker.ts?worker";

const HEARTBEAT_INTERVAL = 60000;
const PONG_TIMEOUT = 10000;

/**
 * Изолированный хук для контроля «полуоткрытого» соединения (Heartbeat / Ping-Pong).
 */
export const useTwitchHeartbeat = () => {
    const socketContext = useSocketContext();
    const connectionStatus = socketContext?.connectionStatus;

    const workerRef = useRef<Worker | null>(null);

    // Принудительный обрыв зависшего сокета при отсутствии PONG-ответа.
    const handleConnectionFailure = useCallback(() => {
        if (!socketContext) return;

        console.warn("[Heartbeat] Потеря сети.");

        workerRef.current?.postMessage({type: HeartbeatWorkerCommand.CLEAR_ALL});

        const client = socketContext.getClient();
        client.forceCloseAndReconnect();
    }, [socketContext]);

    // Отправка системного IRC-запроса PING на сервер Twitch.
    const sendPing = useCallback(() => {
        if (!socketContext || connectionStatus !== CONNECTION_STATUSES.CONNECTED) return;

        const client = socketContext.getClient();

        client.sendRaw("PING :twitch_party_queue");

        workerRef.current?.postMessage({
            type: HeartbeatWorkerCommand.START_PONG_TIMER,
            payload: PONG_TIMEOUT
        });
    }, [socketContext, connectionStatus]);

    /**
     * Сбрасывает таймер ожидания PONG при успехе и перезапускает таймер тишины.
     */
    const handleSocketActivity = useCallback((command: string) => {
        if (connectionStatus !== CONNECTION_STATUSES.CONNECTED || !workerRef.current) return;

        if (command === TwitchIrcCommand.PONG) {
            workerRef.current.postMessage({type: HeartbeatWorkerCommand.CLEAR_PONG_TIMER});
        }

        workerRef.current.postMessage({
            type: HeartbeatWorkerCommand.START_PING_TIMER,
            payload: HEARTBEAT_INTERVAL
        });
    }, [connectionStatus]);

    useEffect(() => {
        const worker = new HeartbeatWorker();
        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent) => {
            const {type} = event.data;

            if (type === HeartbeatWorkerEvent.PING_TICK) {
                sendPing();
            } else if (type === HeartbeatWorkerEvent.PONG_TIMEOUT) {
                handleConnectionFailure();
            }
        };

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, [sendPing, handleConnectionFailure]);

    useEffect(() => {
        if (connectionStatus === CONNECTION_STATUSES.CONNECTED) {
            workerRef.current?.postMessage({
                type: HeartbeatWorkerCommand.START_PING_TIMER,
                payload: HEARTBEAT_INTERVAL
            });
        } else {
            workerRef.current?.postMessage({type: HeartbeatWorkerCommand.CLEAR_ALL});
        }
    }, [connectionStatus]);

    return {
        handleSocketActivity
    };
};
