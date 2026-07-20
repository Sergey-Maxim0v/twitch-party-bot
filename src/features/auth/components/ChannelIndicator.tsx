import React from "react";
import {useChannelSelect} from "../hooks/useChannelSelect";
import {LuRefreshCw} from "react-icons/lu";

export const ChannelIndicator: React.FC = () => {
    const {activeChannel, resetChannel} = useChannelSelect();

    if (!activeChannel) return null;

    return (
        <div className="flex items-center gap-2 bg-base-300/50 px-3 py-1 rounded-lg border border-base-300">
            <div className="flex flex-col text-right">
                <span className="text-xs text-base-content/50 leading-none">Канал</span>
                <span className="text-sm font-bold text-primary truncate max-w-[120px]">
          {activeChannel}
        </span>
            </div>
            <button
                onClick={resetChannel}
                className="btn btn-ghost btn-square btn-xs text-base-content/70 hover:text-primary transition-colors"
                title="Изменить канал"
                aria-label="Изменить канал"
            >
                <LuRefreshCw className="w-3.5 h-3.5"/>
            </button>
        </div>
    );
};
