import type { QueueSettings } from '../../queue-settings/types.ts'
import { QUEUE_ENTRY_ID_PREFIX } from '../../../constants/queue.constants.ts'
import { createId } from '../../../utils/createId.ts'
import type { QueuePlayer, QueuePlayerFormData } from '../types.ts'
import { extractGameNickname } from './queueValidation.utils.ts'

interface CreateJoinPlayerArgs {
  playerData: QueuePlayerFormData;
  customTimestamp?: number;
  settings: Pick<QueueSettings, 'currentGame' | 'commands'>;
}

/** Создаёт запись игрока для добавления в очередь. */
export const createJoinPlayer = ({ playerData, customTimestamp, settings }: CreateJoinPlayerArgs): QueuePlayer => ({
  ...playerData,
  queueEntryId: createId(QUEUE_ENTRY_ID_PREFIX),
  timestamp: customTimestamp || Date.now(),
  gameNickname: extractGameNickname({
    rawMessage: playerData.rawMessage,
    gameConfig: settings.currentGame,
    commandNames: Object.values(settings.commands).map(command => command.name),
  }),
  isVip: playerData.isVip ?? false,
  isModerator: playerData.isModerator ?? false,
  isSubscriber: playerData.isSubscriber ?? false,
})
