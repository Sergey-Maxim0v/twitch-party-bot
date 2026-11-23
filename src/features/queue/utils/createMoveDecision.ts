import type { MoveDecision, QueueState } from '../types'

/**
 * Создаёт решение об отказе от перемещения.
 *
 * @returns Решение с исходным состоянием очереди.
 */
export const createMoveDecision = (
  prev: QueueState,
  playerName: string,
  sourceQueueType: MoveDecision['sourceQueueType'],
  overrides: Partial<MoveDecision> = {},
): MoveDecision => ({
  nextState: prev,
  isMoved: false,
  isNoop: false,
  isBlockedByDuplicate: false,
  isBlockedByDisabledWaiting: false,
  sourceQueueType,
  playerName,
  insertIndex: null,
  displacedToWaiting: [],
  displacedRemoved: [],
  displacedAlreadyWaiting: [],
  ...overrides,
})
