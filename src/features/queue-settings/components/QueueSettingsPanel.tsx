import type {FC} from "react";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import CollapsiblePanel from "../../../components/layout/panel/CollapsiblePanel.tsx";
import {useQueueSettings} from "../hooks/useQueueSettings.ts";
import {SettingsNumberInput} from "./SettingsNumberInput.tsx";
import {SettingsCheckbox} from "./SettingsCheckbox.tsx";
import {QueueCommandsSection} from "./QueueCommandsSection.tsx";
import {QueueBanListSection} from "./QueueBanListSection.tsx";
import {QueueGameSection} from "./QueueGameSection.tsx";

export interface QueueSettingsProps {
    className?: string;
    collapsedClassName?: string;
}

const QueueSettingsPanel: FC<QueueSettingsProps> = ({
                                                        className = "",
                                                        collapsedClassName = ""
                                                    }) => {
    const [isOpen, setIsOpen] = useLocalStorage<boolean>("queue_settings_open", true);
    const {settings, updateSettings} = useQueueSettings();

    const titleClassName = "text-xs font-bold tracking-wide text-base-content/50 uppercase"

    return (
        <CollapsiblePanel
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title="Настройки очереди"
            className={className}
            collapsedClassName={collapsedClassName}
        >
            <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar min-w-0">
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
                    label="Разрешить заходить заранее (будущие очереди)"
                    checked={settings.allowPreJoin}
                    onChange={(checked) => {
                        updateSettings({allowPreJoin: checked});

                        if (!checked) {
                            updateSettings({allowMultipleEntries: false});
                        }
                    }}
                />

                {/* Повторные входы в один состав */}
                <SettingsCheckbox
                    label="Разрешить несколько записей (будущие очереди)"
                    checked={settings.allowMultipleEntries}
                    disabled={!settings.allowPreJoin}
                    onChange={(checked) => updateSettings({allowMultipleEntries: checked})}
                />


                <QueueGameSection/>

                <QueueCommandsSection titleClassName={titleClassName}/>

                <QueueBanListSection titleClassName={titleClassName}/>
            </div>
        </CollapsiblePanel>
    );
};

export default QueueSettingsPanel;
