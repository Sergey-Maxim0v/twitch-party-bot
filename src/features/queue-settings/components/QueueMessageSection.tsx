import type { FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { SettingsCheckbox } from './SettingsCheckbox.tsx'
import { SettingsNumberInput } from './SettingsNumberInput.tsx'
import { SettingsTextInput } from './SettingsTextInput.tsx'

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

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.allowSending}
        label="Разрешить боту отправку сообщений в чат"
        onChange={checked => { handlePermissionsChange('allowSending', checked) }}
      />

      <SettingsTextInput
        label="Префикс для автоматических сообщений в чат Twitch"
        max={20}
        onChange={val => { updateSettings({ messagePrefix: val }) }}
        placeholder="Префикс "
        value={settings.messagePrefix}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueOpen}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение об открытии очереди (мгновенное)"
        onChange={checked => { handlePermissionsChange('onQueueOpen', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueFull}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение об заполнении текущей очереди (мгновенное)"
        onChange={checked => { handlePermissionsChange('onQueueFull', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueClose}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение об закрытии очереди (мгновенное)"
        onChange={checked => { handlePermissionsChange('onQueueClose', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onClearActive}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение об очистке активного состава игроков (мгновенное)"
        onChange={checked => { handlePermissionsChange('onClearActive', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onClearWaiting}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение об очистке списка ожидающих (мгновенное)"
        onChange={checked => { handlePermissionsChange('onClearWaiting', checked) }}
      />

      <SettingsNumberInput
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Задержка ответов бота об изменениях в составе очереди (сек)"
        max={99}
        min={1}
        onChange={val => { updateSettings({ botMessageCooldown: Number(val) }) }}
        value={settings.botMessageCooldown}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberAdd}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение о добавлении игрока в очередь (с задержкой)"
        onChange={checked => { handlePermissionsChange('onMemberAdd', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberRemove}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение о удалении игрока из очереди (с задержкой)"
        onChange={checked => { handlePermissionsChange('onMemberRemove', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberMove}
        disabled={!settings.chatNotificationPermissions.allowSending}
        label="Сообщение о перемещении игрока между очередями (с задержкой)"
        onChange={checked => { handlePermissionsChange('onMemberMove', checked) }}
      />
    </div>
  )
}

export default QueueMessageSection
