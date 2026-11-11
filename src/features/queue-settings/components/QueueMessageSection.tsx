import type { FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { SettingsCheckbox } from './SettingsCheckbox.tsx'
import { SettingsNumberInput } from './SettingsNumberInput.tsx'
import { SettingsTextInput } from './SettingsTextInput.tsx'
import {
  QUEUE_MESSAGE_PREFIX_LABEL,
  QUEUE_NOTIFICATION_LABELS,
  QUEUE_SETTING_LABELS,
} from '../../../constants/queue.constants.ts'
import { SETTINGS_SECTION_CLASS } from '../../../constants/ui.constants.ts'

interface QueueMessageSectionProps {
  titleClassName?: string;
}

/**
 * Секция разрешений и настроек сообщений бота.
 */
export const QueueMessageSection: FC<QueueMessageSectionProps> = ({ titleClassName = '' }) => {
  const { settings, updateSettings } = useQueueSettings()
  const notificationsDisabled = !settings.chatNotificationPermissions.allowSending

  const handlePermissionsChange = (key: keyof typeof settings.chatNotificationPermissions, val: boolean) => {
    updateSettings({
      chatNotificationPermissions: {
        ...settings.chatNotificationPermissions,
        [key]: val,
      },
    })
  }

  return (
    <div className={SETTINGS_SECTION_CLASS}>
      <h3 className={titleClassName}>Разрешения боту на отправку сообщений</h3>

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.allowSending}
        label={QUEUE_NOTIFICATION_LABELS.allowSending}
        onChange={checked => { handlePermissionsChange('allowSending', checked) }}
      />

      <SettingsTextInput
        label={QUEUE_MESSAGE_PREFIX_LABEL}
        max={20}
        onChange={val => { updateSettings({ messagePrefix: val }) }}
        placeholder="Префикс "
        value={settings.messagePrefix}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueOpen}
        disabled={notificationsDisabled}
        label={QUEUE_NOTIFICATION_LABELS.onQueueOpen}
        onChange={checked => { handlePermissionsChange('onQueueOpen', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueFull}
        disabled={notificationsDisabled}
        label={QUEUE_NOTIFICATION_LABELS.onQueueFull}
        onChange={checked => { handlePermissionsChange('onQueueFull', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onQueueClose}
        disabled={notificationsDisabled}
        label={QUEUE_NOTIFICATION_LABELS.onQueueClose}
        onChange={checked => { handlePermissionsChange('onQueueClose', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onClearActive}
        disabled={notificationsDisabled}
        label={QUEUE_NOTIFICATION_LABELS.onClearActive}
        onChange={checked => { handlePermissionsChange('onClearActive', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onClearWaiting}
        disabled={notificationsDisabled}
        label={QUEUE_NOTIFICATION_LABELS.onClearWaiting}
        onChange={checked => { handlePermissionsChange('onClearWaiting', checked) }}
      />

      <SettingsNumberInput
        disabled={notificationsDisabled}
        label={QUEUE_SETTING_LABELS.botMessageCooldown}
        max={99}
        min={1}
        onChange={val => { updateSettings({ botMessageCooldown: Number(val) }) }}
        value={settings.botMessageCooldown}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberAdd}
        disabled={notificationsDisabled}
        label={QUEUE_NOTIFICATION_LABELS.onMemberAdd}
        onChange={checked => { handlePermissionsChange('onMemberAdd', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberRemove}
        disabled={notificationsDisabled}
        label={QUEUE_NOTIFICATION_LABELS.onMemberRemove}
        onChange={checked => { handlePermissionsChange('onMemberRemove', checked) }}
      />

      <SettingsCheckbox
        checked={settings.chatNotificationPermissions.onMemberMove}
        disabled={notificationsDisabled}
        label={QUEUE_NOTIFICATION_LABELS.onMemberMove}
        onChange={checked => { handlePermissionsChange('onMemberMove', checked) }}
      />
    </div>
  )
}
