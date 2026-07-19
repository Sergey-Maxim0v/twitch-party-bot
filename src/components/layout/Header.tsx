import React from 'react';
import {ThemeToggle} from './ThemeToggle';
import {LuTwitch} from "react-icons/lu";
import {useTwitchAuth} from "../../features/auth";

export const Header: React.FC = () => {
    const {session, isAuthenticated, isLoading, login, logout} = useTwitchAuth();

    return (
        <header className="navbar bg-base-200 border-b border-base-300 px-6 flex justify-between items-center">
            <LuTwitch className="mr-2 text-2xl font-black text-primary select-none"/>

            <div className="flex-1">
                <span className="text-xl font-black tracking-tight text-primary select-none">
                  Twitch Party Bot
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-none">
                    <ThemeToggle/>
                </div>

                <div>
                    {isLoading ? (
                        <button className="btn btn-ghost btn-sm disabled" aria-label="Загрузка">
                            <span className="loading loading-spinner loading-xs"></span>
                        </button>
                    ) : isAuthenticated && session ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col text-right">
                                <span className="text-sm font-semibold leading-none text-base-content">
                                  {session.login}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="btn btn-outline btn-error btn-sm"
                            >
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={login}
                            className="btn btn-primary btn-sm flex items-center gap-2"
                        >
                            <LuTwitch className="text-lg"/>
                            Войти
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
