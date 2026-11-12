import { SOCKET_CONNECTION_STATUSES, type ConnectionStatus } from '../../../../services/socket/types.ts'
import { STATUS_BADGE_TYPES, STATUS_TEXTS } from '../../../../constants/ui.constants.ts'
import type { StatusConfig } from '../types'

/**
 * Собирает описание индикатора "Соединение" по состоянию WebSocket-соединения.
 *
 * @param connectionStatus - Текущее состояние соединения с сервером.
 * @returns Текст статуса, тип окраски индикатора и подсказку для него.
 */
export const getNetworkConfig = (connectionStatus: ConnectionStatus): StatusConfig => {
  switch (connectionStatus) {
    case SOCKET_CONNECTION_STATUSES.CONNECTED:
      return {
        statusText: STATUS_TEXTS.CONNECTED,
        badgeType: STATUS_BADGE_TYPES.SUCCESS,
        tooltipText: 'Сеть: Стабильное WebSocket-соединение с сервером Twitch IRC установлено. Ошибок нет.',
      }
    case SOCKET_CONNECTION_STATUSES.CONNECTING:
      return {
        statusText: STATUS_TEXTS.CONNECTING,
        badgeType: STATUS_BADGE_TYPES.WARNING,
        tooltipText: 'Сеть: Выполняется подключение к серверам Twitch... Пожалуйста, подождите.',
      }
    case SOCKET_CONNECTION_STATUSES.FAILED:
      return {
        statusText: STATUS_TEXTS.FAILED,
        badgeType: STATUS_BADGE_TYPES.ERROR,
        tooltipText: 'Сеть: Подключение к Twitch не восстановлено. Причина указана в журнале приложения.',
      }
    case SOCKET_CONNECTION_STATUSES.DISCONNECTED:
    default:
      return {
        statusText: STATUS_TEXTS.DISCONNECTED,
        badgeType: STATUS_BADGE_TYPES.ERROR,
        tooltipText: 'Сеть: Соединение с сервером отсутствует. Проверьте интернет или статус авторизации.',
      }
  }
}
