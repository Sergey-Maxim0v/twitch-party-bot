import {type FC} from "react";
import {LuRefreshCw, LuTwitch} from "react-icons/lu";
import {useAuth} from "../hooks/useAuth.ts";

export const ChannelISelectToggle: FC = () => {
    const {session, activeChannel, resetChannel} = useAuth();

    return (
        <div
            role="button"
            onClick={resetChannel}
            className="flex items-center justify-between px-3 py-2.5 hover:bg-base-100 active:bg-primary active:text-primary-content rounded-md transition-colors"
        >
            <div className="flex items-center gap-2.5 text-sm min-w-0 flex-1 w-0">
                <LuTwitch className="text-primary text-base shrink-0"/>
                <span className="text-base-content/70 shrink-0">Канал:</span>
                <span className="font-semibold truncate max-w-30">
                    {activeChannel || session?.login}
                </span>
            </div>

            <span
                className="badge badge-sm font-semibold opacity-60 flex items-center gap-1 text-[10px] uppercase tracking-wider shrink-0">
                <LuRefreshCw className="text-[9px]"/>
                <span>Сменить</span>
            </span>
        </div>
    );
};
