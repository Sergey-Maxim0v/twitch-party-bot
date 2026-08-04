import {validateChannelName} from "./validateChannelName.ts";

export const getChannelSelectCurrentError = (error: string | null, isValidationTriggered: boolean, value: string): string | null => {
    if (error) return error;
    if (!isValidationTriggered) return null;

    const trimmed = value.trim();

    if (!trimmed) return 'Имя канала не может быть пустым.';
    if (!validateChannelName(trimmed)) return 'Некорректное имя канала Twitch.';

    return null;
};
