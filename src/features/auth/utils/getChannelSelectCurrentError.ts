import {validateChannelName} from "./validateChannelName.ts";

export interface GetChannelErrorParams {
    channelError: string | null;
    isValidationTriggered: boolean;
    value: string;
    isNotFound: boolean
}

export const getChannelSelectCurrentError = ({
                                                 channelError,
                                                 isValidationTriggered,
                                                 value,
                                                 isNotFound
                                             }: GetChannelErrorParams): string | null => {
    if (channelError) return channelError;
    if (isNotFound) return 'Канал не найден на Twitch.'
    if (!isValidationTriggered) return null;

    const trimmed = value.trim();

    if (!trimmed) return 'Имя канала не может быть пустым.';
    if (!validateChannelName(trimmed)) return 'Некорректное имя канала Twitch.';

    return null;
};
