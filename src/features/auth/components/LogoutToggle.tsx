import type {FC} from "react";
import {useAuth} from "../hooks/useAuth";
import {LuLogOut, LuUser} from "react-icons/lu";

export const LogoutToggle: FC = () => {
    const {session, logout, userDisplayName, userAvatar} = useAuth();

    return (
        <div
            role="button"
            onClick={logout}
            className="flex items-center justify-between px-3 py-2.5
            hover:bg-error/10 rounded-md transition-colors select-none"
        >
            <div className="flex items-center gap-2 text-sm min-w-0 flex-1 w-0">
                <LuUser className="text-base text-base-content/60 shrink-0"/>

                <span className="opacity-60 font-medium shrink-0">аккаунт:</span>

                <div className="flex items-center gap-1.5 min-w-0 truncate">
                    {userAvatar && (
                        <div className="avatar shrink-0">
                            <div className="w-4 h-4 rounded-full ring-1 ring-base-content/20 overflow-hidden">
                                <img
                                    src={userAvatar}
                                    alt={userDisplayName || session?.login || 'Аватар'}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                    <span className="font-bold truncate max-w-27.5">
                        {userDisplayName || session?.login}
                    </span>
                </div>
            </div>

            <span
                className="badge badge-error badge-outline badge-sm font-medium flex items-center gap-1 text-xs shrink-0"
            >
                <LuLogOut className="text-[10px]"/>
                <span>Выйти</span>
            </span>
        </div>
    );
}
