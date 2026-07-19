import React from "react";
import {useAuth} from "../hooks/useAuth.tsx";

export const AuthModal: React.FC = () => {
    const {isModalOpen, authStage, error, login, closeModal} = useAuth();

    if (!isModalOpen) return null;

    return (
        <div className="modal modal-open z-50">
            <div className="modal-box max-w-sm flex flex-col items-center text-center p-6 gap-4">

                {/* Ожидание действий в Popup-окне */}
                {authStage === 'waiting' && (
                    <>
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <h3 className="font-bold text-lg">Авторизация на Twitch</h3>
                        <p className="text-sm text-base-content/70">
                            Пожалуйста, завершите вход в открывшемся всплывающем окне.
                        </p>
                        <div className="modal-action w-full mt-2">
                            <button onClick={closeModal} className="btn btn-ghost btn-sm w-full">
                                Отмена
                            </button>
                        </div>
                    </>
                )}

                {/* Проверка токена через Twitch API */}
                {authStage === 'validating' && (
                    <>
                        <span className="loading loading-ring loading-lg text-secondary"></span>
                        <h3 className="font-bold text-lg">Проверка токена</h3>
                        <p className="text-sm text-base-content/70">
                            Верифицируем вашу сессию через официальный API Twitch...
                        </p>
                    </>
                )}

                {/* Успешный вход */}
                {authStage === 'success' && (
                    <>
                        <div
                            className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success">
                            <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg text-success">Успешный вход!</h3>
                        <p className="text-sm text-base-content/70">
                            Добро пожаловать. Окно сейчас закроется автоматически.
                        </p>
                    </>
                )}

                {/* Ошибка в процессе входа */}
                {authStage === 'error' && (
                    <>
                        <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center text-error">
                            <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg text-error">Ошибка входа</h3>
                        <p className="text-sm text-error/90 max-w-xs wrap-break-word">
                            {error || 'Неизвестная ошибка при авторизации.'}
                        </p>
                        <div className="modal-action grid grid-cols-2 gap-2 w-full mt-2">
                            <button onClick={login} className="btn btn-primary btn-sm">
                                Повторить
                            </button>
                            <button onClick={closeModal} className="btn btn-ghost btn-sm">
                                Закрыть
                            </button>
                        </div>
                    </>
                )}

            </div>
            <div className="modal-backdrop bg-black/40 backdrop-blur-xs"></div>
        </div>
    );
};