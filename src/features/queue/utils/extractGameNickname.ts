import type { QueueGameConfig, QueueGameKey } from '../../queue-settings/types.ts'
import { QUEUE_GAME_NICKNAME_PATTERNS, QUEUE_NICKNAME_MAX_LENGTH } from '../../../constants/queue.constants.ts'
import { TWITCH_CHAT_COMMAND_PREFIX } from '../../../constants/twitch.constants.ts'

/** Аргументы извлечения игрового никнейма из сообщения. */
interface ExtractGameNicknameArgs {
  /** Полный текст сообщения */
  rawMessage: string;
  /** Выбранная игра */
  gameConfig?: QueueGameConfig;
}

/** Скомпилированные правила проверки никнейма по ключу игры. */
const gameRegexes = new Map<QueueGameKey, RegExp>()

/**
 * Возвращает правило проверки никнейма для игры.
 * Правила берутся из списка игр и компилируются один раз.
 *
 * @param key - Ключ выбранной игры.
 * @returns Правило проверки или `null`, если для игры правила нет.
 */
const getGameRegex = (key: QueueGameKey): RegExp | null => {
  const cachedRegex = gameRegexes.get(key)
  if (cachedRegex) return cachedRegex

  const pattern = QUEUE_GAME_NICKNAME_PATTERNS[key]
  if (!pattern) return null

  try {
    const regex = new RegExp(pattern)
    gameRegexes.set(key, regex)

    return regex
  } catch (error) {
    console.error('Ошибка в регулярном выражении игры:', error)
    return null
  }
}

/**
 * Сканирует сообщение и извлекает первый никнейм,
 * который строго соответствует правилу выбранной игры.
 *
 * @returns Найденный никнейм или `null`.
 */
export const extractGameNickname = ({
  rawMessage,
  gameConfig,
}: ExtractGameNicknameArgs): string | null => {
  if (!gameConfig) return null

  const regex = getGameRegex(gameConfig.key)
  if (!regex) return null

  const words = rawMessage.trim().split(/\s+/)
  if (!words[0]) return null

  const candidates = words[0].startsWith(TWITCH_CHAT_COMMAND_PREFIX) ? words.slice(1) : words

  for (const word of candidates) {
    if (word.length <= QUEUE_NICKNAME_MAX_LENGTH && regex.test(word)) {
      return word
    }
  }

  return null
}
