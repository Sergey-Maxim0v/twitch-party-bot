import { TWITCH_CHAT_MESSAGE_MAX_LENGTH } from '../../../constants/twitch.constants.ts'

interface FitChatMessageArgs {
  /** Собирает сообщение по числу видимых элементов каждой группы. */
  build: (visibleCounts: number[]) => string
  /** Размеры групп; элементы скрываются с конца. */
  counts: number[]
  /** Минимум видимых элементов для каждой группы. */
  minVisible?: number[]
  /** Предельная длина сообщения. */
  maxLength?: number
}

/**
 * Уменьшает число видимых элементов групп с конца, пока сообщение не уложится в лимит.
 */
export const fitChatMessage = ({
  build,
  counts,
  minVisible,
  maxLength = TWITCH_CHAT_MESSAGE_MAX_LENGTH,
}: FitChatMessageArgs): string => {
  const visible = [...counts]
  const minimums = minVisible ?? counts.map(() => 0)
  let message = build(visible)

  while (message.length > maxLength) {
    const index = visible.findLastIndex((count, groupIndex) => count > minimums[groupIndex])

    if (index < 0) break

    visible[index]--
    message = build(visible)
  }

  return message
}
