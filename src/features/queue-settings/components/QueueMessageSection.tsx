import type {FC} from "react";
import {useQueueSettings} from "../hooks/useQueueSettings.ts";
import {SettingsCheckbox} from "./SettingsCheckbox.tsx";
import {SettingsNumberInput} from "./SettingsNumberInput.tsx";

export interface QueueMessageSectionProps {
    titleClassName?: string;
}

const QueueMessageSection: FC<QueueMessageSectionProps> = ({titleClassName = ""}) => {
    const {settings, updateSettings} = useQueueSettings();

    // TODO:
    //  - поправить types.ts
    //  - написать хендлеры
    //  - общее разрешение, открытие, закрытие, добавление, удаление, перемещение, заполнение

    return (
        <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0">
            <h3 className={titleClassName}>Разрешения боту на отправку сообщений</h3>

            {/* Общее разрешение на отправку сообщений в чат */}
            <SettingsCheckbox
                label="Разрешить боту отправку сообщений в чат"
                checked={false}
                onChange={(checked) => {
                    console.log(checked)
                }}
            />

            {/* Минимальное время ответа бота */}
            <SettingsNumberInput
                label="Задержка ответов бота (сек)"
                min={0}
                max={99}
                value={settings.botMessageCooldown}
                onChange={(val) => updateSettings({botMessageCooldown: Number(val)})}
            />

            <SettingsCheckbox
                label="Сообщение об открытии очереди"
                checked={false}
                onChange={(checked) => {
                    console.log(checked)
                }}
            />

            <SettingsCheckbox
                label="Сообщение об заполнении текущей очереди"
                checked={false}
                onChange={(checked) => {
                    console.log(checked)
                }}
            />

            <SettingsCheckbox
                label="Сообщение об закрытии очереди"
                checked={false}
                onChange={(checked) => {
                    console.log(checked)
                }}
            />

            <SettingsCheckbox
                label="Сообщение о добавлении игрока в очередь"
                checked={false}
                onChange={(checked) => {
                    console.log(checked)
                }}
            />

            <SettingsCheckbox
                label="Сообщение о удалении игрока из очереди"
                checked={false}
                onChange={(checked) => {
                    console.log(checked)
                }}
            />

            <SettingsCheckbox
                label="Сообщение о перемещении игрока между очередями"
                checked={false}
                onChange={(checked) => {
                    console.log(checked)
                }}
            />
        </div>
    )
}

export default QueueMessageSection;