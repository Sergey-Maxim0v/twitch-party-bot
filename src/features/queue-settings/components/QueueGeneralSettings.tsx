import {type FC, useCallback, useMemo} from "react";
import {useQueueSettings} from "../hooks/useQueueSettings.ts";
import {SettingsNumberInput} from "./SettingsNumberInput.tsx";
import {SettingsCheckbox} from "./SettingsCheckbox.tsx";
import {useQueue} from "../../queue/hooks/useQueue.ts";
import {LOG_ACTOR_ROLE, LOG_INITIATOR} from "../../queue/types.ts";
import {useAuth} from "../../auth/hooks/useAuth.ts";

export interface QueueGeneralSettingsProps {
    titleClassName?: string;
}

const QueueGeneralSettings: FC<QueueGeneralSettingsProps> = ({titleClassName}) => {
    const {settings, updateSettings} = useQueueSettings();
    const {clearActiveQueue, clearQueueHistory, clearFutureQueue} = useQueue()
    const {session} = useAuth()

    const argsClearFnc = useMemo(() => {
        return {
            initiator: LOG_INITIATOR.STREAMER_UI,
            actorUsername: session?.login ?? "",
            actorRole: LOG_ACTOR_ROLE.APPLICATION
        }
    }, [session?.login])

    const handleClearAllQueue = useCallback(() => {
        clearActiveQueue(argsClearFnc)
        clearFutureQueue(argsClearFnc)
        clearQueueHistory(argsClearFnc)
    }, [clearActiveQueue, argsClearFnc, clearQueueHistory, clearFutureQueue])

    return (
        <>
            <h3 className={titleClassName}>
                Основные настройки
            </h3>


            {/* Лимит участников в очереди */}
            <SettingsNumberInput
                label="Лимит участников в очереди"
                min={1}
                max={99}
                value={settings.maxQueueSize}
                onChange={(val) => updateSettings({maxQueueSize: Number(val) || 1})}
            />

            {/* Разрешить вставать заранее */}
            <SettingsCheckbox
                label="Разрешить запись в будущие очереди"
                checked={settings.allowPreJoin}
                onChange={(checked) => {
                    updateSettings({allowPreJoin: checked});

                    if (!checked) {
                        updateSettings({allowMultipleEntries: false});
                    }
                }}
            />

            {/* Повторные записи */}
            <SettingsCheckbox
                label="Разрешить повторную запись в будущие очереди"
                checked={settings.allowMultipleEntries}
                disabled={!settings.allowPreJoin}
                onChange={(checked) => updateSettings({allowMultipleEntries: checked})}
            />

            {/* Через сколько игр игрок может повторно участвовать */}
            <SettingsNumberInput
                label="Пропуск сыгравших (на X игр)"
                min={0}
                max={99}
                value={settings.gamesPlayedCooldown}
                onChange={(val) => updateSettings({gamesPlayedCooldown: Number(val) || 0})}
            />

            {/* Через сколько минут игрок может повторно участвовать */}
            <SettingsNumberInput
                label="Кулдаун для игроков (в минутах)"
                min={0}
                max={1440}
                value={settings.sessionHistoryCooldown}
                onChange={(val) => updateSettings({sessionHistoryCooldown: Number(val) || 0})}
            />

            {/* Максимально количество игр для одного участника */}
            <SettingsNumberInput
                label="Лимит игр для одного игрока"
                min={0}
                max={99}
                value={settings.maxGamesPerUser || 99}
                onChange={(val) => updateSettings({maxGamesPerUser: Number(val) || 99})}
            />

            {/* Ставить подписчиков в начало очереди */}
            <SettingsCheckbox
                label="Приоритет для подписчиков"
                checked={settings.prioritizeSubscribers || false}
                disabled={settings.subscribersOnly}
                onChange={(checked) => updateSettings({prioritizeSubscribers: checked})}
            />

            {/* Только подписчики */}
            <SettingsCheckbox
                label="Вход только для подписчиков"
                checked={settings.subscribersOnly || false}
                onChange={(checked) => updateSettings({subscribersOnly: checked})}
            />

            {/* Минимальное время ответа бота */}
            <SettingsNumberInput
                label="Задержка ответов бота (сек)"
                min={0}
                max={99}
                value={settings.botMessageCooldown}
                onChange={(val) => updateSettings({botMessageCooldown: Number(val)})}
            />

            <div className="form-control w-full flex flex-col gap-2">
                <button
                    type="button"
                    className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
                    onClick={() => clearActiveQueue(argsClearFnc)}
                >
                    Очистить текущую очередь
                </button>
                <button
                    type="button"
                    className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
                    onClick={() => clearFutureQueue(argsClearFnc)}
                >
                    Очистить будущие очереди
                </button>
                <button
                    type="button"
                    className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
                    onClick={() => clearQueueHistory(argsClearFnc)}
                >
                    Очистить историю
                </button>
                <button
                    type="button"
                    className="btn btn-block btn-error btn-sm shadow-sm font-semibold truncate"
                    onClick={handleClearAllQueue}
                >
                    Очистить все очереди
                </button>
            </div>
        </>
    )
}

export default QueueGeneralSettings