import type {QueueState, QueuePlayer, JoinSuccessResult} from "../types";
import type {QueueJoinOptions} from "./checkPlayerJoinRestrictions.ts";
import {createNewSession} from "./createNewSession.ts";

interface JoinStateResult {
    nextState: QueueState;
    resultType: JoinSuccessResult;
    shouldCloseQueue: boolean;
}

/**
 *  Функция распределения игрока по сессиям и вычисления нового стейта приложения
 */
export const calculateJoinState = ({playerData, state, settings}: QueueJoinOptions): JoinStateResult => {
    const {userId, isSubscriber} = playerData;
    const fullPlayer: QueuePlayer = {...playerData, timestamp: Date.now()};

    const updatedCurrent = state.currentSession ? {...state.currentSession} : createNewSession("Текущий состав");
    const updatedFuture = [...state.futureSessions];
    const isInCurrent = state.currentSession?.players.some(p => p.userId === userId) ?? false;

    // А: Помещаем в текущую очередь
    if (updatedCurrent.players.length < settings.maxQueueSize && !isInCurrent) {
        if (settings.prioritizeSubscribers && isSubscriber) {
            updatedCurrent.players = [fullPlayer, ...updatedCurrent.players];
        } else {
            updatedCurrent.players = [...updatedCurrent.players, fullPlayer];
        }

        const shouldClose = settings.autoCloseOnFull && updatedCurrent.players.length === settings.maxQueueSize;

        return {
            nextState: {...state, currentSession: updatedCurrent},
            resultType: 'added_to_current',
            shouldCloseQueue: shouldClose
        };
    }

    // Б: Помещаем в будущую очередь (если разрешено предзаходить)
    if (settings.allowPreJoin) {
        if (updatedFuture.length === 0) {
            updatedFuture.push(createNewSession("Будущий состав №1"));
        }

        let targetSession = updatedFuture[updatedFuture.length - 1];
        if (targetSession.players.length >= settings.maxQueueSize) {
            targetSession = createNewSession(`Будущий состав №${updatedFuture.length + 1}`);
            updatedFuture.push(targetSession);
        }

        targetSession.players.push(fullPlayer);

        return {
            nextState: {...state, futureSessions: updatedFuture},
            resultType: isInCurrent ? 'added_to_future_exists_in_current' : 'added_to_future',
            shouldCloseQueue: false
        };
    }

    // В: Очередь заполнена, предзапись отключена
    return {
        nextState: state,
        resultType: 'queue_full',
        shouldCloseQueue: false
    };
};
