import type {FC} from "react";
import {useAuth} from "../../../features/auth";

export interface ActiveProfileInfo {
    className?: string;
}

const ActiveProfileInfo: FC<ActiveProfileInfo> = ({className = ''}) => {
    const {
        session,
        activeChannel,
        activeChannelDisplayName,
        activeChannelAvatar,
        userDisplayName,
        userAvatar
    } = useAuth();

    return (
        <div className={`flex items-center gap-1.5 normal-case ${className}`}>

            {/* Канал */}
            <span className="flex items-center gap-1">
                <span className="opacity-60">канал</span>
                <span className="flex items-center gap-1 font-bold text-primary max-w-25 truncate">
                    {activeChannelAvatar && (
                        <div className="avatar shrink-0">
                            <div className="w-3.5 h-3.5 rounded-full ring-1 ring-primary/20">
                                <img
                                    src={activeChannelAvatar}
                                    alt={activeChannelDisplayName || 'Аватар канала'}
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </div>
                    )}
                    <span>{activeChannelDisplayName || activeChannel || session?.login}</span>
                </span>
            </span>

            {/* Разделитель */}
            <span className="opacity-30 mx-0.5">|</span>

            {/* Аккаунт */}
            <span className="flex items-center gap-1">
                <span className="opacity-60">аккаунт</span>
                <span className="flex items-center gap-1 font-bold max-w-25 truncate">
                    {userAvatar && (
                        <div className="avatar shrink-0">
                            <div className="w-3.5 h-3.5 rounded-full ring-1 ring-base-content/20">
                                <img
                                    src={userAvatar}
                                    alt={userDisplayName || session?.login || 'Аватар пользователя'}
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </div>
                    )}
                    <span>{userDisplayName || session?.login}</span>
                </span>
            </span>
        </div>
    );
};

export default ActiveProfileInfo;