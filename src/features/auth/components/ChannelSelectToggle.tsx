import {type FC} from "react";
import {LuRefreshCw, LuTwitch} from "react-icons/lu";
import {useAuth} from "../hooks/useAuth.ts";

export const ChannelSelectToggle: FC = () => {
    const {
        session,
        activeChannel,
        activeChannelDisplayName,
        activeChannelAvatar,
        openChannelModal
    } = useAuth();

    return (
        <div
            role="button"
            onClick={openChannelModal}
            className="flex items-center justify-between px-3 py-2.5
            hover:bg-base-100 active:bg-primary active:text-primary-content
            rounded-md transition-colors select-none"
        >
            <div className="flex items-center gap-2 text-sm min-w-0 flex-1 w-0">
                <LuTwitch className="text-base text-primary shrink-0"/>
                <span className="opacity-60 font-medium shrink-0">канал:</span>

                <div className="flex items-center gap-1.5 min-w-0 truncate">
                    {activeChannelAvatar && (
                        <div className="avatar shrink-0">
                            <div className="w-4 h-4 rounded-full ring-1 ring-primary/20 overflow-hidden">
                                <img
                                    src={activeChannelAvatar}
                                    alt={activeChannelDisplayName || 'Аватар канала'}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                    <span className="font-bold text-primary truncate">
                        {activeChannelDisplayName || activeChannel || session?.login}
                    </span>
                </div>
            </div>

            <span
                className="badge badge-sm font-medium opacity-70 flex items-center gap-1 text-xs shrink-0"
            >
                <LuRefreshCw className="text-[10px] animate-pulse"/>
                <span>Сменить</span>
            </span>
        </div>
    );
};
