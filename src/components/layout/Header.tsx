import {type FC} from 'react';
import ThemeToggle from './ThemeToggle';
import {LuLogOut, LuTwitch, LuUser} from "react-icons/lu";
import {ChannelISelectToggle, useAuth} from "../../features/auth";

const Header: FC = () => {
    const {session, isAuthenticated, isLoading, login, logout, activeChannel} = useAuth();

    return (
        <header
            className="navbar bg-base-200 border-b border-base-300 px-6 flex justify-between items-center select-none">
            {/* Логотип */}
            <div className="flex items-center gap-2">
                <LuTwitch className="text-2xl font-black text-primary"/>
                <span className="text-xl font-black tracking-tight text-primary">
                    Twitch Party Bot
                </span>
            </div>

            {/* Правая часть */}
            <div className="flex items-center gap-4">
                {isLoading ? (
                    <button className="btn btn-ghost btn-sm disabled" aria-label="Загрузка">
                        <span className="loading loading-spinner loading-xs"></span>
                    </button>
                ) : isAuthenticated && session ? (
                    <div className="dropdown dropdown-end">
                        <div
                            role="button"
                            tabIndex={0}
                            className="btn btn-ghost btn-sm flex items-center gap-1.5 normal-case px-3
                            hover:bg-base-300 transition-colors text-sm font-medium text-base-content"
                        >
                            <span className="opacity-60">канал</span>
                            <span className="font-bold text-primary max-w-25 truncate">
                                {activeChannel || session.login}
                            </span>
                            <span className="opacity-30 mx-0.5">|</span>
                            <span className="opacity-60">аккаунт</span>
                            <span className="font-bold max-w-25 truncate">
                                {session.login}
                            </span>
                        </div>

                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-1 shadow-xl bg-base-300 rounded-box
                            w-80 gap-0.5 z-50 mt-2 border border-base-100"
                        >
                            {/* Сменить канал */}
                            <li className="p-0">
                                <ChannelISelectToggle/>
                            </li>

                            {/* Переключить тему */}
                            <li className="p-0">
                                <ThemeToggle/>
                            </li>

                            {/* Выйти из аккаунта */}
                            <li>
                                <div
                                    role="button"
                                    onClick={logout}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-error/10 text-error rounded-md transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 text-sm min-w-0 flex-1 w-0">
                                        <LuUser className="text-base-content/60 text-base shrink-0"/>
                                        <span className="text-base-content/70 shrink-0">Аккаунт:</span>
                                        <span className="font-semibold text-base-content truncate max-w-27.5">
                                            {session.login}
                                        </span>
                                    </div>
                                    <span
                                        className="badge badge-error badge-outline badge-sm font-semibold
                                        text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                                        <LuLogOut className="text-[9px]"/>
                                        <span>Выйти</span>
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                ) : (
                    /* Неавторизованное состояние */
                    <div className="flex items-center gap-2">
                        <ThemeToggle/>
                        <button
                            onClick={login}
                            className="btn btn-primary btn-sm flex items-center gap-2"
                        >
                            <LuTwitch className="text-lg"/>
                            <span>Войти</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;