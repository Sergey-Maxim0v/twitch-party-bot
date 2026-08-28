import type { FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { SettingsCheckbox } from './SettingsCheckbox.tsx'
import { SettingsNumberInput } from './SettingsNumberInput.tsx'

export interface QueueMessageSectionProps {
  titleClassName?: string;
}

const QueueMessageSection: FC<QueueMessageSectionProps> = ({ titleClassName = '' }) => {
  const { settings, updateSettings } = useQueueSettings()

  const handlePermissionsChange = (key: keyof typeof settings.chatNotificationPermissions, val: boolean) => {
    updateSettings({
      chatNotificationPermissions: {
        ...settings.chatNotificationPermissions,
        [key]: val,
      },
    })
  }

  return (
    <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0">
      <h3 className={titleClassName}>Разрешения боту на отправку сообщений</h3>

      {/* Общее разрешение на отправку сообщений в чат */}
      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.allowSending}
        label="Разрешить боту отправку сообщений в чат"
        onChange={checked => { handlePermissionsChange('allowSending', checked) }}
      />

      {/* Минимальное время ответа бота */}
      <SettingsNumberInput
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Задержка ответов бота (сек)"
        max={99}
        min={0}
        onChange={val => { updateSettings({ botMessageCooldown: Number(val) }) }}
        value={settings.botMessageCooldown}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueOpen}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение об открытии очереди"
        onChange={checked => { handlePermissionsChange('onQueueOpen', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueFull}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение об заполнении текущей очереди"
        onChange={checked => { handlePermissionsChange('onQueueFull', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueClose}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение об закрытии очереди"
        onChange={checked => { handlePermissionsChange('onQueueClose', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberAdd}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение о добавлении игрока в очередь"
        onChange={checked => { handlePermissionsChange('onMemberAdd', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberRemove}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение о удалении игрока из очереди"
        onChange={checked => { handlePermissionsChange('onMemberRemove', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberMove}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение о перемещении игрока между очередями"
        onChange={checked => { handlePermissionsChange('onMemberMove', checked) }}
      />
    </div>
  )
}

export default QueueMessageSection
