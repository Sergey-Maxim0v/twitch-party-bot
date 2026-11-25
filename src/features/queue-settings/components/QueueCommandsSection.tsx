import { type FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { useSettingsLog } from '../hooks/useSettingsLog.ts'
import type { QueueSettings, SettingsSectionProps } from '../types.ts'
import {
  QUEUE_COMMAND_CONFLICT_MESSAGES,
  QUEUE_COMMAND_LABELS,
  QUEUE_PREFIX_CONFLICT_MESSAGES,
} from '../../../constants/queue.constants.ts'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { SettingsCommandInput } from './SettingsCommandInput.tsx'
import { getCommandNameConflict } from '../utils/getCommandNameConflict.ts'
import { getPrefixCommandConflict } from '../utils/getPrefixCommandConflict.ts'
import { SettingsSection } from './SettingsSection.tsx'

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
export const QueueCommandsSection: FC<Pick<SettingsSectionProps, 'titleClassName'>> = ({
  titleClassName = '',
}) => {
  const { settings, updateSettings } = useQueueSettings()
  const logSettings = useSettingsLog()

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

  const validateCommandName = (key: keyof QueueSettings['commands'], value: string): string | null => {
    const prefixConflict = getPrefixCommandConflict(settings.messagePrefix, [value])
    if (prefixConflict) {
      return QUEUE_PREFIX_CONFLICT_MESSAGES.COMMAND(settings.messagePrefix ?? '')
    }

    const duplicateKey = getCommandNameConflict(value, settings.commands, key)
    return duplicateKey
      ? QUEUE_COMMAND_CONFLICT_MESSAGES.DUPLICATE(
        settings.commands[duplicateKey].name,
        QUEUE_COMMAND_LABELS[duplicateKey],
      )
      : null
  }

  const handleCommandRejected = (key: keyof QueueSettings['commands'], error: string) => {
    logSettings({
      message: QUEUE_COMMAND_CONFLICT_MESSAGES.REJECT(
        error,
        QUEUE_COMMAND_LABELS[key],
        settings.commands[key].name,
      ),
      status: APP_LOG_STATUSES.ERROR,
    })
  }

  return (
    <SettingsSection title="Команды чата" titleClassName={titleClassName}>
      {COMMAND_FIELDS.map(({ key, label }) => (
        <SettingsCommandInput
          commandValue={settings.commands[key].name}
          isModeratorValue={settings.commands[key].isModeratorOnly}
          key={key}
          label={label}
          onCommandChange={val => handleCommandChange(key, val)}
          onCommandRejected={error => handleCommandRejected(key, error)}
          onModeratorChange={chk => handleModChange(key, chk)}
          validate={value => validateCommandName(key, value)}
        />
      ))}
    </SettingsSection>
  )
}
