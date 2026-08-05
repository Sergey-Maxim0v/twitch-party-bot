import {type FC} from "react";

interface StatusIndicatorProps {
    label: string;
    statusText: string;
    badgeType: "success" | "warning" | "error" | "info" | "neutral";
    tooltipText: string;
}

/**
 * @param label - Заголовок группы статуса (например, "Сеть" или "Чат")
 * @param statusText - Короткое слово состояния (например, "Подключен", "Ожидание")
 * @param badgeType - Тип окраски индикатора в стиле DaisyUI (success, warning, error, info, neutral)
 * @param tooltipText - Текст подробной подсказки при наведении
 */
const StatusIndicator: FC<StatusIndicatorProps> = ({
                                                       label,
                                                       statusText,
                                                       badgeType,
                                                       tooltipText
                                                   }) => {
    const badgeColors: Record<StatusIndicatorProps["badgeType"], string> = {
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
        info: "bg-info",
        neutral: "bg-neutral-content"
    };

    return (
        <div
            className="tooltip tooltip-bottom tooltip-neutral text-left z-100"
            data-tip={tooltipText}
        >
            <div className="flex items-center gap-1.5 px-3 h-8 bg-base-300 rounded-lg border border-base-100
            hover:bg-base-200 transition-colors select-none">
                <span className="text-xs opacity-60 font-medium">
                    {label}:
                </span>

                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        {badgeType !== "error" && badgeType !== "neutral" && (
                            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 
                            ${badgeColors[badgeType]}`}></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${badgeColors[badgeType]}`}></span>
                    </span>

                    <span className="text-sm font-bold text-base-content">
                        {statusText}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatusIndicator;
