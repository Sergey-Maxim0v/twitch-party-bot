import { SOCKET_CONNECTION_STATUSES, type ConnectionStatus } from '../../../../services/socket/types.ts'
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
        statusText: 'Подключен',
        badgeType: 'success',
        tooltipText: 'Сеть: Стабильное WebSocket-соединение с сервером Twitch IRC установлено. Ошибок нет.',
      }
    case SOCKET_CONNECTION_STATUSES.CONNECTING:
      return {
        statusText: 'Ожидание',
        badgeType: 'warning',
        tooltipText: 'Сеть: Выполняется подключение к серверам Twitch... Пожалуйста, подождите.',
      }
    case SOCKET_CONNECTION_STATUSES.DISCONNECTED:
    default:
      return {
        statusText: 'Отключен',
        badgeType: 'error',
        tooltipText: 'Сеть: Соединение с сервером отсутствует. Проверьте интернет или статус авторизации.',
      }
  }
}
