import type { QueueGameConfig } from '../../queue-settings/types.ts'

/** Аргументы извлечения игрового никнейма из сообщения. */
interface ExtractGameNicknameArgs {
  /** Полный текст сообщения */
  rawMessage: string;
  /** Текущие настройки игры и регулярного выражения */
  gameConfig?: QueueGameConfig;
}

/**
 * Сканирует сообщение и извлекает первый никнейм,
 * который строго соответствует регулярному выражению игры.
 *
 * @returns Найденный никнейм или `null`.
 */
export const extractGameNickname = ({
  rawMessage,
  gameConfig,
}: ExtractGameNicknameArgs): string | null => {
  if (!gameConfig?.validationPattern) {
    return null
  }

  const trimmed = rawMessage.trim()

  if (!trimmed) {
    return null
  }

  const textParts = trimmed.split(/\s+/)

  const isCommand = textParts[0].startsWith('!')
  const wordsToScan = isCommand ? textParts.slice(1) : textParts

  try {
    const regex = new RegExp(gameConfig.validationPattern)

    for (const word of wordsToScan) {
      if (regex.test(word)) {
        return word
      }
    }
  } catch (e) {
    console.error('Ошибка в регулярном выражении игры:', e)
  }

  return null
}
