import type {QueueState} from "../types";
import {createInitialState} from "./createInitialState";

/**
 * Сбрасывает состояние очереди до начального
 */
export const calculateResetState = (): QueueState => {
    return createInitialState();
};
