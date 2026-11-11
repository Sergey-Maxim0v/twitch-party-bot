import { TWITCH_CHAT_ACCESS_STATUSES, type ChatAccessStatus } from '../../../../services/socket/types.ts'
import { STATUS_BADGE_TYPES, STATUS_TEXTS } from '../../../../constants/ui.constants.ts'
import type { StatusConfig } from '../types'

/**
 * Собирает описание индикатора "Доступность чата" по текущему уровню прав аккаунта.
 *
 * @param chatAccessStatus - Текущий статус доступа аккаунта к чату.
 * @returns Текст статуса, тип окраски индикатора и подсказку для него.
 */
export const getChatConfig = (chatAccessStatus: ChatAccessStatus): StatusConfig => {
  switch (chatAccessStatus) {
    case TWITCH_CHAT_ACCESS_STATUSES.CONNECTED:
      return {
        statusText: STATUS_TEXTS.CONNECTED,
        badgeType: STATUS_BADGE_TYPES.SUCCESS,
        tooltipText: 'Чат: Полный доступ. Вы можете читать и отправлять сообщения.',
      }
    case TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED:
      return {
        statusText: STATUS_TEXTS.RESTRICTED,
        badgeType: STATUS_BADGE_TYPES.WARNING,
        tooltipText: 'Чат: Аккаунт ограничен. Вы можете читать чат, но отправка сообщений заблокирована.',
      }
    case TWITCH_CHAT_ACCESS_STATUSES.BANNED:
      return {
        statusText: STATUS_TEXTS.BANNED,
        badgeType: STATUS_BADGE_TYPES.ERROR,
        tooltipText: 'Чат: Доступ заблокирован. Этот аккаунт был полностью забанен на целевом канале.',
      }
    case TWITCH_CHAT_ACCESS_STATUSES.OFFLINE:
    default:
      return {
        statusText: STATUS_TEXTS.OFFLINE,
        badgeType: STATUS_BADGE_TYPES.NEUTRAL,
        tooltipText: 'Чат: Инициализация не выполнена. Ожидание успешного сетевого соединения.',
      }
  }
}
