import {type FC} from 'react';
import ThemeToggle from './ThemeToggle';
import {LuTwitch} from "react-icons/lu";
import {ChannelISelectToggle, LogoutToggle, useAuth} from "../../features/auth";

const Header: FC = () => {
    const {session, isAuthenticated, isLoading, login, activeChannel} = useAuth();

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
                            <li className="p-0">
                                <ChannelISelectToggle/>
                            </li>

                            <li className="p-0">
                                <ThemeToggle/>
                            </li>

                            <li className="p-0">
                                <LogoutToggle/>
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