import type {FC} from "react";
import {useQueueSettings} from "../hooks/useQueueSettings.ts";

export interface QueueResetSectionProps {
    titleClassName?: string;
    className?: string;
}

const QueueResetSettings: FC<QueueResetSectionProps> = ({titleClassName = "", className = ""}) => {
    const {resetSettings} = useQueueSettings()
    return (
        <div className={`w-full min-w-0 space-y-3 ${className}`}>
            <h3 className={titleClassName}>Восстановить настройки по умолчанию</h3>

            <button
                type="button"
                className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
                onClick={() => resetSettings()}
            >
                Восстановить настройки
            </button>
        </div>
    )
}

export default QueueResetSettings;
