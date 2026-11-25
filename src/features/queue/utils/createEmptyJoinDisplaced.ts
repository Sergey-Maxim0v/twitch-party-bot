import type { QueueJoinDisplaced } from '../types.ts'

/** Создаёт пустой набор вытесненных игроков. */
export const createEmptyJoinDisplaced = (): QueueJoinDisplaced => ({
  displacedToWaiting: [],
  displacedRemoved: [],
  displacedAlreadyWaiting: [],
})
