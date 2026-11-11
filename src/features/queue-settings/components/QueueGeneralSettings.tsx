import { type FC, useCallback } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { SettingsNumberInput } from './SettingsNumberInput.tsx'
import { SettingsCheckbox } from './SettingsCheckbox.tsx'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { QUEUE_SETTING_LABELS } from '../../../constants/queue.constants.ts'
import { SETTINGS_SECTION_CLASS } from '../../../constants/ui.constants.ts'

interface QueueGeneralSettingsProps {
  titleClassName?: string;
}

/**
 * Секция основных настроек очереди.
 */
export const QueueGeneralSettings: FC<QueueGeneralSettingsProps> = ({ titleClassName }) => {
  const { settings, updateSettings } = useQueueSettings()
  const { clearWaitingQueue, balanceQueues } = useQueue()
  const { session, userDisplayName } = useAuth()

  const actorUsername = userDisplayName ?? session?.login ?? ''

  const handleChangeQueueLimit = useCallback((val: number) => {
    updateSettings({ maxQueueSize: val })

    if (settings.moveOnSizeChange) {
      balanceQueues({
        source: APP_LOG_SOURCES.STREAMER_UI,
        actorUsername,
        overrideMaxQueueSize: val,
      })
    }
  }, [actorUsername, balanceQueues, settings.moveOnSizeChange, updateSettings])

  const handleChangeMoveOnSizeChange = useCallback((checked: boolean) => {
    updateSettings({ moveOnSizeChange: checked })

    if (checked) {
      balanceQueues({ source: APP_LOG_SOURCES.STREAMER_UI, actorUsername, overrideMoveOnSizeChange: checked })
    }
  }, [actorUsername, balanceQueues, updateSettings])

  return (
    <div className={SETTINGS_SECTION_CLASS}>
      <h3 className={titleClassName}>
        Основные настройки
      </h3>

      <SettingsNumberInput
        label={QUEUE_SETTING_LABELS.maxQueueSize}
        max={99}
        min={1}
        onChange={handleChangeQueueLimit}
        value={settings.maxQueueSize}
      />

      <SettingsCheckbox
        checked={settings.allowPreJoin}
        label={QUEUE_SETTING_LABELS.allowPreJoin}
        onChange={checked => {
          updateSettings({ allowPreJoin: checked })

          if (!checked) {
            updateSettings({ allowMultipleEntries: false })
            clearWaitingQueue({ source: APP_LOG_SOURCES.STREAMER_UI, actorUsername })
          }
        }}
      />

      <SettingsCheckbox
        checked={settings.allowMultipleEntries}
        disabled={!settings.allowPreJoin}
        label={QUEUE_SETTING_LABELS.allowMultipleEntries}
        onChange={checked => { updateSettings({ allowMultipleEntries: checked }) }}
      />

      <SettingsCheckbox
        checked={settings.moveOnSizeChange}
        disabled={!settings.allowPreJoin}
        label={QUEUE_SETTING_LABELS.moveOnSizeChange}
        onChange={ handleChangeMoveOnSizeChange}
      />

      <SettingsNumberInput
        label={QUEUE_SETTING_LABELS.gamesPlayedCooldown}
        max={99}
        min={0}
        onChange={val => { updateSettings({ gamesPlayedCooldown: Number(val) || 0 }) }}
        value={settings.gamesPlayedCooldown}
      />

      <SettingsNumberInput
        label={QUEUE_SETTING_LABELS.sessionHistoryCooldown}
        max={1440}
        min={0}
        onChange={val => { updateSettings({ sessionHistoryCooldown: Number(val) || 0 }) }}
        value={settings.sessionHistoryCooldown}
      />

      <SettingsNumberInput
        label={QUEUE_SETTING_LABELS.maxGamesPerUser}
        max={99}
        min={0}
        onChange={val => { updateSettings({ maxGamesPerUser: Number(val) || 0 }) }}
        value={settings.maxGamesPerUser || 0}
      />

      <SettingsCheckbox
        checked={settings.prioritizeSubscribers || false}
        disabled={settings.subscribersOnly}
        label={QUEUE_SETTING_LABELS.prioritizeSubscribers}
        onChange={checked => { updateSettings({ prioritizeSubscribers: checked }) }}
      />

      <SettingsCheckbox
        checked={settings.subscribersOnly || false}
        label={QUEUE_SETTING_LABELS.subscribersOnly}
        onChange={checked => { updateSettings({ subscribersOnly: checked }) }}
      />
    </div>
  )
}
