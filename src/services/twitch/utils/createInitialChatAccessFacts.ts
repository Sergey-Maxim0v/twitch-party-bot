import type { ChatAccessFacts } from '../types.ts'

/**
 * Создаёт пустой набор фактов доступа к чату.
 *
 * @returns Факты без ограничений и тегов комнаты.
 */
export const createInitialChatAccessFacts = (): ChatAccessFacts => ({
  isBanned: false,
  isSendBlocked: false,
  isTimeoutActive: false,
  roomTags: {},
})
