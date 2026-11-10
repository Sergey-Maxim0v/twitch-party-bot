import type { FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import type { QueueSettings } from '../types.ts'
import { SettingsCommandInput } from './SettingsCommandInput.tsx'

interface QueueCommandsSectionProps {
  titleClassName?: string;
}

/** Описание команды чата для отображения в настройках. */
interface CommandField {
  key: keyof QueueSettings['commands'];
  label: string;
}

const COMMAND_FIELDS: CommandField[] = [
  { key: 'join', label: 'Вступление в очередь' },
  { key: 'leave', label: 'Выход из очереди' },
  { key: 'show', label: 'Показать текущую очередь' },
  { key: 'clear', label: 'Очистить очереди' },
  { key: 'add', label: 'Добавить в очередь' },
  { key: 'delete', label: 'Удалить из очереди' },
  { key: 'start', label: 'Открыть очередь' },
  { key: 'stop', label: 'Закрыть очередь' },
  { key: 'play', label: 'Завершить текущую очередь' },
]

/**
 * Секция команд чата.
 */
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

      {COMMAND_FIELDS.map(({ key, label }) => (
        <SettingsCommandInput
          commandValue={settings.commands[key].name}
          isModeratorValue={settings.commands[key].isModeratorOnly}
          key={key}
          label={label}
          onCommandChange={val => { handleCommandChange(key, val) }}
          onModeratorChange={chk => { handleModChange(key, chk) }}
        />
      ))}
    </div>
  )
}
