import type {Dispatch, SetStateAction} from "react";
import type {QueueState, LogInitiator} from "../types";
import {LOG_STATUS} from "../types";
import type {QueueSettings} from "../../queue-settings/types.ts";

export interface HandleBanPlayerArgs {
    /** Уникальный ID пользователя на Twitch (если известен, для фильтрации) */
    userId?: string;
    /** Логин/никнейм пользователя для занесения в бан-лист */
    username: string;
    /** Красивое отображаемое имя (для логов) */
    displayedUsername?: string;
    /** Источник вызова команды (чат/интерфейс) */
    initiator: LogInitiator;
    /** Никнейм того, кто выдал бан */
    actorUsername: string;
    /** Текущие настройки очереди */
    settings: QueueSettings;
    /** Функция обновления настроек */
    updateSettings: (newSettings: Partial<QueueSettings>) => void;
    /** Функция обновления состояния игроков */
    setState: Dispatch<SetStateAction<QueueState>>;
    /** Хелпер провайдера для записи логов */
    pushLog: (
        message: string,
        status: typeof LOG_STATUS[keyof typeof LOG_STATUS],
        initiator: LogInitiator,
        actorUsername: string
    ) => void;
}

/**
 * Хендлер для добавления игрока во внутренний бан-лист очереди
 * с последующей полной очисткой его записей из всех текущих списков.
 */
export const handleBanPlayer = ({
                                    userId,
                                    username,
                                    displayedUsername,
                                    initiator,
                                    actorUsername,
                                    settings,
                                    updateSettings,
                                    setState,
                                    pushLog
                                }: HandleBanPlayerArgs): void => {
    const targetLogin = username.toLowerCase();
    const displayName = displayedUsername || username;

    // 1. Проверяем, нет ли уже пользователя в бан-листе настроек
    const alreadyBanned = settings.banList.some(b => b.toLowerCase() === targetLogin);

    if (alreadyBanned) {
        pushLog(
            `Ошибка бана: пользователь ${displayName} уже находится в бан-листе очереди.`,
            LOG_STATUS.REJECTED,
            initiator,
            actorUsername
        );
        return;
    }

    // 2. Обновляем бан-лист в настройках очереди (добавляем оригинальный никнейм)
    const updatedBanList = [...settings.banList, username];
    updateSettings({banList: updatedBanList});

    // 3. Вычищаем игрока из активной и будущей очередей по userId или по логину
    let removedCount = 0;

    setState(prev => {
        const activeMatches = prev.activeQueue.filter(p => p.userId === userId || p.username.toLowerCase() === targetLogin);
        const futureMatches = prev.futureQueue.filter(p => p.userId === userId || p.username.toLowerCase() === targetLogin);

        removedCount = activeMatches.length + futureMatches.length;

        if (removedCount === 0) {
            return prev;
        }

        return {
            ...prev,
            activeQueue: prev.activeQueue.filter(p => p.userId !== userId && p.username.toLowerCase() !== targetLogin),
            futureQueue: prev.futureQueue.filter(p => p.userId !== userId && p.username.toLowerCase() !== targetLogin)
        };
    });

    // 4. Формируем и отправляем итоговый лог
    const cleanDetails = removedCount > 0 ? ` (удален из ${removedCount} очередей)` : "";
    const logMessage = `Пользователь ${displayName} добавлен во внутренний бан-лист очереди${cleanDetails}.`;

    pushLog(logMessage, LOG_STATUS.SUCCESS, initiator, actorUsername);
};
