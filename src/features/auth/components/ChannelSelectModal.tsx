import React, {useState} from "react";
import {useAuth} from "../hooks/useAuth.tsx";
import {validateChannelName} from "../../../services/twitch";

export const ChannelSelectModal: React.FC = () => {
    const {
        session,
        isAuthenticated,
        hasSelectedChannel,
        error,
        selectOwnChannel,
        selectCustomChannel
    } = useAuth();

    const [inputValue, setInputValue] = useState(() => session?.login || '');
    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

    let currentError: string | null = null;

    if (error) {
        currentError = error;
    } else if (isValidationTriggered) {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            currentError = 'Имя канала не может быть пустым.';
        } else if (!validateChannelName(trimmed)) {
            currentError = 'Некорректное имя канала Twitch.';
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsValidationTriggered(true);
        selectCustomChannel(inputValue);
    };

    if (!isAuthenticated || hasSelectedChannel) return null;

    const inputClassName = `input w-full ${
        currentError ? 'input-error text-error bg-error/10' : 'input-bordered'
    }`;

    return (
        <div className="modal modal-open z-40">
            <div className="modal-box max-w-sm flex flex-col p-6 gap-4">
                <div className="text-center">
                    <h3 className="font-bold text-xl text-base-content">Выбор канала чата</h3>
                    <p className="text-sm text-base-content/60 mt-1">
                        Укажите канал, сообщения которого бот должен начать отслеживать.
                    </p>
                </div>

                {/* Способ 1: Быстрый вход на свой канал */}
                <button
                    onClick={selectOwnChannel}
                    className="btn btn-primary w-full flex flex-col h-auto py-2.5 gap-0.5"
                >
                    <span className="text-xs">Подключить канал</span>
                    {session?.login && (
                        <span className="font-bold text-sm">{session.login}</span>
                    )}
                </button>

                {/* Способ 2: Ручной ввод для тестов с альтернативных аккаунтов */}
                <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3 w-full">
                    <div className="form-control w-full">
                        <input
                            type="text"
                            placeholder="Название канала"
                            value={inputValue}
                            onChange={handleInputChange}
                            className={inputClassName}
                            autoComplete="off"
                            spellCheck="false"
                        />
                        {currentError && (
                            <label className="label py-1">
                                <span className="label-text-alt text-error font-medium">{currentError}</span>
                            </label>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary  btn-outline w-full btn-sm flex flex-col h-14 py-2 gap-0.5 overflow-hidden"
                    >
                        <span className="text-xs">Подключить канал</span>
                        {inputValue ? (
                            <span className="font-bold text-sm truncate max-w-full">
                              {inputValue}
                            </span>
                        ) : (
                            <span className="text-sm select-none opacity-0" aria-hidden="true">
                              &nbsp;
                            </span>
                        )}
                    </button>
                </form>
            </div>
            <div className="modal-backdrop bg-black/10 backdrop-blur-xs"></div>
        </div>
    );
};
