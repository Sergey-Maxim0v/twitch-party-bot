import type {QueueState} from "../types.ts";
import {createNewSession} from "./createNewSession.ts";

export const createInitialState = (): QueueState => ({
    currentSession: createNewSession("Текущий состав"),
    futureSessions: [],
    historySessions: [],
    playerCooldownTimestamps: {},
    logs: []
});