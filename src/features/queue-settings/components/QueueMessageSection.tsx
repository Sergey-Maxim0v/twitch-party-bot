import type {FC} from 'react'
import {useQueueSettings} from '../hooks/useQueueSettings.ts'
import {SettingsCheckbox} from './SettingsCheckbox.tsx'
import {SettingsNumberInput} from './SettingsNumberInput.tsx'

export interface QueueMessageSectionProps {
  titleClassName?: string;
}

const QueueMessageSection: FC<QueueMessageSectionProps> = ({titleClassName = ''}) => {
  const {settings, updateSettings} = useQueueSettings()

  const handlePermissionsChange = (key: keyof typeof settings.chatNotificationPermissions, val: boolean) => {
    updateSettings({
      chatNotificationPermissions: {
        ...settings.chatNotificationPermissions,
        [key]: val
      }
    })
  }

  return (
    <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0">
      <h3 className={titleClassName}>Разрешения боту на отправку сообщений</h3>

      {/* Общее разрешение на отправку сообщений в чат */}
      <SettingsCheckbox
        label="Разрешить боту отправку сообщений в чат"
        checked={settings.chatNotificationPermissions.allowSending}
        onChange={(checked) => handlePermissionsChange('allowSending', checked)}
      />

      {/* Минимальное время ответа бота */}
      <SettingsNumberInput
        label="Задержка ответов бота (сек)"
        min={0}
        max={99}
        disabled={!settings.chatNotificationPermissions.allowSending}
        value={settings.botMessageCooldown}
        onChange={(val) => updateSettings({botMessageCooldown: Number(val)})}
      />

      <SettingsCheckbox
        label="Сообщение об открытии очереди"
        disabled={!settings.chatNotificationPermissions.allowSending}
        checked={settings.chatNotificationPermissions.onQueueOpen}
        onChange={(checked) => handlePermissionsChange('onQueueOpen', checked)}
      />

      <SettingsCheckbox
        label="Сообщение об заполнении текущей очереди"
        disabled={!settings.chatNotificationPermissions.allowSending}
        checked={settings.chatNotificationPermissions.onQueueFull}
        onChange={(checked) => handlePermissionsChange('onQueueFull', checked)}
      />

      <SettingsCheckbox
        label="Сообщение об закрытии очереди"
        disabled={!settings.chatNotificationPermissions.allowSending}
        checked={settings.chatNotificationPermissions.onQueueClose}
        onChange={(checked) => handlePermissionsChange('onQueueClose', checked)}
      />

      <SettingsCheckbox
        label="Сообщение о добавлении игрока в очередь"
        disabled={!settings.chatNotificationPermissions.allowSending}
        checked={settings.chatNotificationPermissions.onMemberAdd}
        onChange={(checked) => handlePermissionsChange('onMemberAdd', checked)}
      />

      <SettingsCheckbox
        label="Сообщение о удалении игрока из очереди"
        disabled={!settings.chatNotificationPermissions.allowSending}
        checked={settings.chatNotificationPermissions.onMemberRemove}
        onChange={(checked) => handlePermissionsChange('onMemberRemove', checked)}
      />

      <SettingsCheckbox
        label="Сообщение о перемещении игрока между очередями"
        disabled={!settings.chatNotificationPermissions.allowSending}
        checked={settings.chatNotificationPermissions.onMemberMove}
        onChange={(checked) => handlePermissionsChange('onMemberMove', checked)}
      />
    </div>
  )
}

export default QueueMessageSection