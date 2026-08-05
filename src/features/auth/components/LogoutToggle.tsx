import type {FC} from "react";
import {useAuth} from "../hooks/useAuth";
import {LuLogOut, LuUser} from "react-icons/lu";

export const LogoutToggle: FC = () => {
    const {session, logout, userDisplayName, userAvatar} = useAuth();

    return (
        <div
            role="button"
            onClick={logout}
            className="flex items-center justify-between px-3 py-2.5 hover:bg-error/10 text-error rounded-md transition-colors select-none"
        >
            <div className="flex items-center gap-2.5 text-sm min-w-0 flex-1 w-0">
                <LuUser className="text-base-content/60 text-base shrink-0"/>
                <span className="text-base-content/70 shrink-0">Аккаунт:</span>

                {userAvatar ? (
                    <div className="avatar shrink-0">
                        <div className="w-5 h-5 rounded-full ring-1 ring-error/20">
                            <img
                                src={userAvatar}
                                alt={userDisplayName || session?.login || 'Аватар'}
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    </div>
                ) : (
                    <LuUser className="text-base-content/60 text-base shrink-0"/>
                )}

                <span className="font-semibold text-base-content truncate max-w-27.5">
                    {userDisplayName || session?.login}
                </span>
            </div>

            <span>
                <span
                    className="badge badge-error badge-outline badge-sm font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <LuLogOut className="text-[9px]"/>
                    <span>Выйти</span>
                </span>
            </span>
        </div>
    );
}
