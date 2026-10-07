import { type FC, useCallback } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { SettingsNumberInput } from './SettingsNumberInput.tsx'
import { SettingsCheckbox } from './SettingsCheckbox.tsx'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'

export interface QueueGeneralSettingsProps {
  titleClassName?: string;
}

const QueueGeneralSettings: FC<QueueGeneralSettingsProps> = ({ titleClassName }) => {
  const { settings, updateSettings } = useQueueSettings()
  const { clearWaitingQueue, balanceQueues } = useQueue()
  const { session, userDisplayName } = useAuth()

  const actorUsername = userDisplayName ?? session?.login ?? ''

  const handleChangeQueueLimit = useCallback((val: number) => {
    updateSettings({ maxQueueSize: val })

    if (settings.moveOnSizeChange) {
      balanceQueues({
        source: LOG_SOURCE.STREAMER_UI,
        actorUsername,
        overrideMaxQueueSize: val,
      })
    }
  }, [actorUsername, balanceQueues, settings.moveOnSizeChange, updateSettings])

  const handleChangeMoveOnSizeChange = useCallback((checked: boolean) => {
    updateSettings({ moveOnSizeChange: checked })

    if (checked) {
      balanceQueues({ source: LOG_SOURCE.STREAMER_UI, actorUsername, overrideMoveOnSizeChange: checked })
    }
  }, [actorUsername, balanceQueues, updateSettings])

  return (
    <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0">
      <h3 className={titleClassName}>
        Основные настройки
      </h3>

      <SettingsNumberInput
        label="Лимит участников в очереди"
        max={99}
        min={1}
        onChange={handleChangeQueueLimit}
        value={settings.maxQueueSize}
      />

      <SettingsCheckbox
        checked={settings.allowPreJoin}
        label="Разрешить запись в список ожидающих"
        onChange={checked => {
          updateSettings({ allowPreJoin: checked })

          if (!checked) {
            updateSettings({ allowMultipleEntries: false })
            clearWaitingQueue({ source: LOG_SOURCE.STREAMER_UI, actorUsername })
          }
        }}
      />

      <SettingsCheckbox
        checked={settings.allowMultipleEntries}
        disabled={!settings.allowPreJoin}
        label="Разрешить запись в список ожидающих участников текущей очереди"
        onChange={checked => { updateSettings({ allowMultipleEntries: checked }) }}
      />

      <SettingsCheckbox
        checked={settings.moveOnSizeChange}
        disabled={!settings.allowPreJoin}
        label="Разрешить автоперенос игроков из списка ожидающих при изменении размера очереди"
        onChange={ handleChangeMoveOnSizeChange}
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
        onChange={val => { updateSettings({ maxGamesPerUser: Number(val) || 0 }) }}
        value={settings.maxGamesPerUser || 0}
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
