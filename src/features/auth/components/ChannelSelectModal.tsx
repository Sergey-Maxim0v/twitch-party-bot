import {useState, type FC, type ChangeEvent, type SyntheticEvent, useEffect} from "react";
import {useAuth} from "../hooks/useAuth.ts";
import {useSocketRef} from "../../../services/socket/hooks/useSocketRef.ts";
import {validateChannelName} from "../utils/validateChannelName.ts";
import {LuX} from "react-icons/lu";
import {getChannelSelectCurrentError} from "../utils/getChannelSelectCurrentError.ts";
import {TWITCH_STORAGE_KEYS} from "../config.ts";
import {validateChannelExists} from "../utils";

export const ChannelSelectModal: FC = () => {
    const {
        session,
        isAuthenticated,
        hasSelectedChannel,
        isChannelModalOpen,
        closeChannelModal,
        channelError,
        selectOwnChannel,
        selectCustomChannel
    } = useAuth();

    const {connect} = useSocketRef();

    const [inputValue, setInputValue] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

    const storedChannel = localStorage.getItem(TWITCH_STORAGE_KEYS.ACTIVE_CHANNEL);
    const isChannelSelectedInSystem = storedChannel && storedChannel !== 'null';

    // Слушатель нажатия клавиши Esc
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && hasSelectedChannel) {
                closeChannelModal();
            }
        };

        if (isChannelModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isChannelModalOpen, hasSelectedChannel, closeChannelModal]);

    const currentError = getChannelSelectCurrentError({
        channelError,
        isValidationTriggered,
        value: inputValue,
        isNotFound
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (isNotFound) setIsNotFound(false);
    };

    // Обработчик для подключения к собственному каналу
    const handleOwnChannelClick = async () => {
        if (!session?.login || !session?.accessToken || isChecking) return;

        setIsChecking(true);
        setIsNotFound(false);

        const exists = await validateChannelExists(session.login, session.accessToken);

        if (exists) {
            selectOwnChannel();
            connect(session.login, session.accessToken, session.login);
        } else {
            setIsNotFound(true);
        }
        setIsChecking(false);
    };

    // Обработчик для ручного ввода канала
    const handleCustomSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (isChecking) return;

        setIsValidationTriggered(true);
        setIsNotFound(false);

        const trimmed = inputValue.trim();

        if (trimmed && validateChannelName(trimmed) && session?.accessToken && session?.login) {
            setIsChecking(true);

            const exists = await validateChannelExists(trimmed, session.accessToken);

            if (exists) {
                selectCustomChannel(trimmed);
                connect(trimmed, session.accessToken, session.login);
            } else {
                setIsNotFound(true);
            }
            setIsChecking(false);
        }
    };

    if (!isAuthenticated || !isChannelModalOpen) return null;

    const inputClassName = `input w-full ${
        currentError ? 'input-error text-error bg-error/10' : 'input-bordered'
    }`;

    return (
        <div className="modal modal-open z-100">
            <div className="modal-box max-w-sm flex flex-col p-6 gap-4 relative">

                {/* Кнопка закрытия */}
                {isChannelSelectedInSystem && !isChecking && (
                    <button
                        onClick={closeChannelModal}
                        className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-base-content/70 hover:text-base-content"
                        aria-label="Закрыть модальное окно"
                    >
                        <LuX className="text-base"/>
                    </button>
                )}

                <div className="text-center mt-2">
                    <h3 className="font-bold text-xl text-base-content">Выбор канала чата</h3>
                    <p className="text-sm text-base-content/60 mt-1">
                        Укажите канал, сообщения которого бот должен начать отслеживать.
                    </p>
                </div>

                {/* Способ 1: Быстрый вход на свой канал */}
                <button
                    onClick={handleOwnChannelClick}
                    disabled={isChecking}
                    className="btn btn-primary w-full flex flex-col h-auto py-2.5 gap-0.5"
                >
                    <span className="text-xs">Подключить канал</span>
                    {session?.login && (
                        <span className="font-bold text-sm">{session.login}</span>
                    )}
                </button>

                {/* Способ 2: Ручной ввод канала */}
                <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3 w-full">
                    <div className="form-control w-full">
                        <input
                            type="text"
                            name="Channel-name"
                            placeholder="Название канала"
                            value={inputValue}
                            onChange={handleInputChange}
                            className={inputClassName}
                            autoComplete="off"
                            spellCheck="false"
                            disabled={isChecking}
                        />
                        {currentError && (
                            <label className="label py-1">
                                <span
                                    className="label-text-alt text-error font-medium wrap-break-word
                                    whitespace-normal w-full">
                                    {currentError}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Главная кнопка сабмита */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-outline w-full btn-sm flex flex-col h-14
                        justify-center items-center py-2 gap-0.5 overflow-hidden"
                        disabled={!inputValue.trim() || isChecking}
                    >
                        {isChecking ? (
                            <span className="loading loading-spinner loading-md"/>
                        ) : inputValue.trim() ? (
                            <>
                                <span className="text-xs">
                                    Подключить канал
                                </span>
                                <span className="font-bold text-sm truncate max-w-full">
                                    {inputValue}
                                </span>
                            </>
                        ) : (
                            <span className="font-bold text-sm">
                                Введите название
                            </span>
                        )}
                    </button>
                </form>
            </div>

            {/* Бэкдроп */}
            <div
                onClick={(isChannelSelectedInSystem && !isChecking) ? closeChannelModal : undefined}
                className={`modal-backdrop bg-black/40 backdrop-blur-xs ${hasSelectedChannel && !isChecking ? 'cursor-pointer' : ''}`}
            />
        </div>
    );
};
