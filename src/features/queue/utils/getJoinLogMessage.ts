import {JOIN_RESULT, type JoinSuccessResult} from "../types.ts";

interface GetJoinLogMessageOptions {
    resultType: JoinSuccessResult;
    gameNickname?: string | null;
}

/**
 * Функция формирует текст лога на основе результата входа игрока
 */
export const getJoinLogMessage = ({resultType, gameNickname}: GetJoinLogMessageOptions): string => {
    const nicknameText = gameNickname ? `никнейм ${gameNickname}` : "никнейм не выделен";

    switch (resultType) {
        case JOIN_RESULT.ADDED_TO_CURRENT:
            return `добавлен в текущую очередь, ${nicknameText}`;

        case JOIN_RESULT.ADDED_TO_FUTURE_EXISTS_IN_CURRENT:
            return `добавлен в будущую очередь, в текущей очереди уже участвует`;

        case JOIN_RESULT.ADDED_TO_FUTURE:
            return `добавлен в следующие очереди, ${nicknameText}`;

        case JOIN_RESULT.QUEUE_FULL:
            return `отклонено, очередь полностью заполнена`;

        default:
            return `обработка входа игрока (${resultType})`;
    }
};
