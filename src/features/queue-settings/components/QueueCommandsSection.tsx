import type { FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings'
import { SettingsCommandInput } from './SettingsCommandInput.tsx'

interface QueueCommandsSectionProps {
  titleClassName?: string;
}

export const QueueCommandsSection: FC<QueueCommandsSectionProps> = ({
  titleClassName = '',
}) => {
  const { settings, updateSettings } = useQueueSettings()

  const handleCommandChange = (key: keyof typeof settings.commands, name: string) => {
    updateSettings({
      commands: {
        ...settings.commands,
        [key]: { ...settings.commands[key], name },
      },
    })
  }

  const handleModChange = (key: keyof typeof settings.commands, isModeratorOnly: boolean) => {
    updateSettings({
      commands: {
        ...settings.commands,
        [key]: { ...settings.commands[key], isModeratorOnly },
      },
    })
  }

  return (
    <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0">
      <h3 className={titleClassName}>Команды чата</h3>

      <SettingsCommandInput
        commandValue={settings.commands.join.name}
        isModeratorValue={settings.commands.join.isModeratorOnly}
        label="Вступление в очередь"
        onCommandChange={val => { handleCommandChange('join', val) }}
        onModeratorChange={chk => { handleModChange('join', chk) }}
      />

      <SettingsCommandInput
        commandValue={settings.commands.leave.name}
        isModeratorValue={settings.commands.leave.isModeratorOnly}
        label="Выход из очереди"
        onCommandChange={val => { handleCommandChange('leave', val) }}
        onModeratorChange={chk => { handleModChange('leave', chk) }}
      />

      <SettingsCommandInput
        commandValue={settings.commands.show.name}
        isModeratorValue={settings.commands.show.isModeratorOnly}
        label="Показать текущую очередь"
        onCommandChange={val => { handleCommandChange('show', val) }}
        onModeratorChange={chk => { handleModChange('show', chk) }}
      />

      <SettingsCommandInput
        commandValue={settings.commands.clear.name}
        isModeratorValue={settings.commands.clear.isModeratorOnly}
        label="Очистить текущую очередь"
        onCommandChange={val => { handleCommandChange('clear', val) }}
        onModeratorChange={chk => { handleModChange('clear', chk) }}
      />

      <SettingsCommandInput
        commandValue={settings.commands.add.name}
        isModeratorValue={settings.commands.add.isModeratorOnly}
        label="Добавить в очередь"
        onCommandChange={val => { handleCommandChange('add', val) }}
        onModeratorChange={chk => { handleModChange('add', chk) }}
      />

      <SettingsCommandInput
        commandValue={settings.commands.delete.name}
        isModeratorValue={settings.commands.delete.isModeratorOnly}
        label="Удалить из очереди"
        onCommandChange={val => { handleCommandChange('delete', val) }}
        onModeratorChange={chk => { handleModChange('delete', chk) }}
      />

      <SettingsCommandInput
        commandValue={settings.commands.start.name}
        isModeratorValue={settings.commands.start.isModeratorOnly}
        label="Открыть очередь"
        onCommandChange={val => { handleCommandChange('start', val) }}
        onModeratorChange={chk => { handleModChange('start', chk) }}
      />

      <SettingsCommandInput
        commandValue={settings.commands.stop.name}
        isModeratorValue={settings.commands.stop.isModeratorOnly}
        label="Закрыть очередь"
        onCommandChange={val => { handleCommandChange('stop', val) }}
        onModeratorChange={chk => { handleModChange('stop', chk) }}
      />
    </div>
  )
}
