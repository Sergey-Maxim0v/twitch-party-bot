import type {FC} from "react";
import {useQueueSettings} from "../hooks/useQueueSettings.ts";
import {SettingsNumberInput} from "./SettingsNumberInput.tsx";
import {SettingsCheckbox} from "./SettingsCheckbox.tsx";

export interface QueueGeneralSettingsProps {
    titleClassName?: string;
}

const QueueGeneralSettings: FC<QueueGeneralSettingsProps> = ({titleClassName}) => {
    const {settings, updateSettings} = useQueueSettings();

    return (
        <>
            <h3 className={titleClassName}>
                Основные настройки
            </h3>

            {/* Главная кнопка управления статусом очереди */}
            <div className="form-control w-full">
                <button
                    type="button"
                    className={`btn btn-block btn-sm shadow-sm font-semibold truncate ${
                        settings.isQueueOpen ? 'btn-error btn-outline' : 'btn-primary'
                    }`}
                    onClick={() => updateSettings({isQueueOpen: !settings.isQueueOpen})}
                >
                    {settings.isQueueOpen ? 'Закрыть приём заявок' : 'Открыть приём заявок'}
                </button>
            </div>

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
        </>
    )
}

export default QueueGeneralSettings