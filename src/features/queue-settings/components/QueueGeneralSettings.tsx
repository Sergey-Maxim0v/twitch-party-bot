import { type FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { SettingsNumberInput } from './SettingsNumberInput.tsx'
import { SettingsCheckbox } from './SettingsCheckbox.tsx'

export interface QueueGeneralSettingsProps {
  titleClassName?: string;
}

const QueueGeneralSettings: FC<QueueGeneralSettingsProps> = ({ titleClassName }) => {
  const { settings, updateSettings } = useQueueSettings()

  return (
    <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0">
      <h3 className={titleClassName}>
        Основные настройки
      </h3>

      <SettingsNumberInput
        label="Лимит участников в очереди"
        max={99}
        min={1}
        onChange={val => { updateSettings({ maxQueueSize: Number(val) || 1 }) }}
        value={settings.maxQueueSize}
      />

      <SettingsCheckbox
        checked={settings.allowPreJoin}
        label="Разрешить запись в список ожидающих"
        onChange={checked => {
          updateSettings({ allowPreJoin: checked })

          if (!checked) {
            updateSettings({ allowMultipleEntries: false })
          }
        }}
      />

      <SettingsCheckbox
        checked={settings.allowMultipleEntries}
        disabled={!settings.allowPreJoin}
        label="Разрешить записть в список ожидающих участников текущей очереди"
        onChange={checked => { updateSettings({ allowMultipleEntries: checked }) }}
      />

      <SettingsCheckbox
        checked={settings.moveOnSizeChange}
        disabled={!settings.allowPreJoin}
        label="Разрешить автоперенос игроков из списка ожидающих при изменении размера очереди"
        onChange={checked => { updateSettings({ moveOnSizeChange: checked }) }}
      />

      <SettingsNumberInput
        label="Через сколько игр игрок может повторно участвовать"
        max={99}
        min={0}
        onChange={val => { updateSettings({ gamesPlayedCooldown: Number(val) || 0 }) }}
        value={settings.gamesPlayedCooldown}
      />

      <SettingsNumberInput
        label="Через сколько минут игрок может повторно участвовать"
        max={1440}
        min={0}
        onChange={val => { updateSettings({ sessionHistoryCooldown: Number(val) || 0 }) }}
        value={settings.sessionHistoryCooldown}
      />

      <SettingsNumberInput
        label="Лимит игр для одного игрока"
        max={99}
        min={0}
        onChange={val => { updateSettings({ maxGamesPerUser: Number(val) || 99 }) }}
        value={settings.maxGamesPerUser || 99}
      />

      <SettingsCheckbox
        checked={settings.prioritizeSubscribers || false}
        disabled={settings.subscribersOnly}
        label="Приоритет для подписчиков"
        onChange={checked => { updateSettings({ prioritizeSubscribers: checked }) }}
      />

      <SettingsCheckbox
        checked={settings.subscribersOnly || false}
        label="Вход только для подписчиков"
        onChange={checked => { updateSettings({ subscribersOnly: checked }) }}
      />
    </div>
  )
}

export default QueueGeneralSettings
