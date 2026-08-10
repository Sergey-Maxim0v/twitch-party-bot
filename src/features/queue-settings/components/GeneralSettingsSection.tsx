import type {FC} from "react";
import {useQueueSettings} from '../hooks/useQueueSettings';
import {SettingsCheckbox} from "./SettingsCheckbox.tsx";
import {SettingsNumberInput} from "./SettingsNumberInput.tsx";

export const GeneralSettingsSection: FC = () => {
    const {settings, updateSettings} = useQueueSettings();

    return (
        <div className="space-y-4 border-b border-base-300 pb-6 w-full min-w-0">
            <h3 className="text-xs font-bold tracking-wide text-base-content/50 uppercase">
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

            {/* Лимит размера очереди */}
            <SettingsNumberInput
                label="Максимальный размер очереди"
                min={1}
                max={99}
                value={settings.maxQueueSize}
                onChange={(val) => updateSettings({maxQueueSize: Number(val) || 1})}
            />

            {/* Автозакрытие при заполнении */}
            <SettingsCheckbox
                label="Автозакрытие при заполнении"
                checked={settings.autoCloseOnFull}
                onChange={(checked) => updateSettings({autoCloseOnFull: checked})}
            />

            {/* Разрешить вставать заранее */}
            <SettingsCheckbox
                label="Разрешить заходить заранее (Pre-Join)"
                checked={settings.allowPreJoin}
                onChange={(checked) => updateSettings({allowPreJoin: checked})}
            />

            {/* Повторные входы в один состав */}
            <SettingsCheckbox
                label="Разрешить несколько записей (дубли)"
                checked={settings.allowMultipleEntries}
                onChange={(checked) => updateSettings({allowMultipleEntries: checked})}
            />
        </div>
    );
};
