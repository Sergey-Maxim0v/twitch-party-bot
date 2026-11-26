import { QUEUE_HIDDEN_MEMBERS_MARK } from '../../../constants/queue.constants.ts'

/** Возвращает пометку скрытых участников, например ` +3`. */
export const formatHiddenMembersCount = (count: number): string =>
  count > 0 ? ` ${QUEUE_HIDDEN_MEMBERS_MARK}${count}` : ''
