import type { FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import type { QueueSettings } from '../types.ts'
import { QUEUE_COMMAND_LABELS } from '../../../constants/queue.constants.ts'
import { SETTINGS_SECTION_CLASS } from '../../../constants/ui.constants.ts'
import { SettingsCommandInput } from './SettingsCommandInput.tsx'

interface QueueCommandsSectionProps {
  titleClassName?: string;
}

/** Описание команды чата для отображения в настройках. */
interface CommandField {
  key: keyof QueueSettings['commands'];
  label: string;
}

const COMMAND_FIELDS: CommandField[] = (
  Object.keys(QUEUE_COMMAND_LABELS) as Array<keyof QueueSettings['commands']>
).map(key => ({ key, label: QUEUE_COMMAND_LABELS[key] }))

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
    <div className={SETTINGS_SECTION_CLASS}>
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
