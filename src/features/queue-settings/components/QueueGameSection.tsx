import type {ChangeEvent, FC} from "react";
import {useQueueSettings} from "../hooks/useQueueSettings.ts";
import {GAME_PATTERNS, QUEUE_GAMES, type QueueGameKey} from "../types";

interface QueueGameSectionProps {
    className?: string;
}

export const QueueGameSection: FC<QueueGameSectionProps> = ({
                                                                className = '',
                                                            }) => {
    const {settings, updateSettings} = useQueueSettings();

    const handleGameChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedKey = e.target.value as QueueGameKey | '';

        if (!selectedKey) {
            updateSettings({currentGame: undefined});
            return;
        }

        updateSettings({
            currentGame: {
                key: selectedKey,
                validationPattern: GAME_PATTERNS[selectedKey]
            }
        });
    };

    return (
        <div className={`p-3 rounded-xl bg-base-200/40 border border-base-300 space-y-4 w-full min-w-0 ${className}`}>
            <div className="flex flex-col gap-1 w-full min-w-0">
                <span className="text-xs font-semibold tracking-wide text-base-content/60">
                    Валидация никнеймов для игры
                </span>

                <select
                    className="select select-bordered select-sm w-full
                    focus:select-primary focus:outline-none focus:ring-0 focus:ring-offset-0 outline-none
                    text-sm mt-1"
                    value={settings.currentGame?.key || ''}
                    onChange={handleGameChange}
                >
                    <option value="">—</option>

                    {Object.entries(QUEUE_GAMES).map(([key, name]) => (
                        <option key={key} value={key}>
                            {name}
                        </option>
                    ))}
                </select>

                <p className="text-[11px] text-base-content/50 mt-1 break-all h-1">
                    Активный паттерн:
                    {settings.currentGame ? (
                        <code className="bg-base-300 px-1 rounded text-primary">
                            {settings.currentGame.validationPattern}
                        </code>
                    ) : " не выбрано"}
                </p>
            </div>
        </div>
    );
};
