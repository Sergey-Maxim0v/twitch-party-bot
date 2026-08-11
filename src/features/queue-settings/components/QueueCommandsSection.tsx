import type {FC} from "react";
import {useQueueSettings} from '../hooks/useQueueSettings';
import {SettingsCommandInput} from "./SettingsCommandInput.tsx";

interface QueueCommandsSectionProps {
    titleClassName?: string;
}

export const QueueCommandsSection: FC<QueueCommandsSectionProps> = ({
                                                                        titleClassName = ''
                                                                    }) => {
    const {settings, updateSettings} = useQueueSettings();

    const handleCommandChange = (key: keyof typeof settings.commands, name: string) => {
        updateSettings({
            commands: {
                ...settings.commands,
                [key]: {...settings.commands[key], name}
            }
        });
    };

    const handleModChange = (key: keyof typeof settings.commands, isModeratorOnly: boolean) => {
        updateSettings({
            commands: {
                ...settings.commands,
                [key]: {...settings.commands[key], isModeratorOnly}
            }
        });
    };

    return (
        <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0">
            <h3 className={titleClassName}>Команды чата</h3>

            <div className="p-3 rounded-xl bg-base-200/40 border border-base-300 space-y-4 w-full min-w-0">
                <SettingsCommandInput
                    label="Вступление в очередь"
                    commandValue={settings.commands.join.name}
                    isModeratorValue={settings.commands.join.isModeratorOnly}
                    onCommandChange={(val) => handleCommandChange('join', val)}
                    onModeratorChange={(chk) => handleModChange('join', chk)}
                />

                <SettingsCommandInput
                    label="Выход из очереди"
                    commandValue={settings.commands.leave.name}
                    isModeratorValue={settings.commands.leave.isModeratorOnly}
                    onCommandChange={(val) => handleCommandChange('leave', val)}
                    onModeratorChange={(chk) => handleModChange('leave', chk)}
                />

                <SettingsCommandInput
                    label="Показать текущую очередь"
                    commandValue={settings.commands.show.name}
                    isModeratorValue={settings.commands.show.isModeratorOnly}
                    onCommandChange={(val) => handleCommandChange('show', val)}
                    onModeratorChange={(chk) => handleModChange('show', chk)}
                />

                <SettingsCommandInput
                    label="Очистить текущую очередь"
                    commandValue={settings.commands.clear.name}
                    isModeratorValue={settings.commands.clear.isModeratorOnly}
                    onCommandChange={(val) => handleCommandChange('clear', val)}
                    onModeratorChange={(chk) => handleModChange('clear', chk)}
                />

                <SettingsCommandInput
                    label="Добавить в очередь"
                    commandValue={settings.commands.add.name}
                    isModeratorValue={settings.commands.add.isModeratorOnly}
                    onCommandChange={(val) => handleCommandChange('add', val)}
                    onModeratorChange={(chk) => handleModChange('add', chk)}
                />

                <SettingsCommandInput
                    label="Удалить из очереди"
                    commandValue={settings.commands.delete.name}
                    isModeratorValue={settings.commands.delete.isModeratorOnly}
                    onCommandChange={(val) => handleCommandChange('delete', val)}
                    onModeratorChange={(chk) => handleModChange('delete', chk)}
                />
            </div>
        </div>
    );
};
