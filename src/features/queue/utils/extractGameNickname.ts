import type { QueueGameConfig, QueueGameKey } from '../../queue-settings/types.ts'
import { QUEUE_GAME_NICKNAME_PATTERNS, QUEUE_NICKNAME_MAX_LENGTH } from '../../../constants/queue.constants.ts'

/** Аргументы извлечения игрового никнейма из сообщения. */
interface ExtractGameNicknameArgs {
  /** Полный текст сообщения */
  rawMessage: string;
  /** Выбранная игра */
  gameConfig?: QueueGameConfig;
  /** Настроенные имена команд чата */
  commandNames: readonly string[];
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
 * Первое слово пропускается, если совпадает с именем команды чата без учёта регистра.
 *
 * @returns Найденный никнейм или `null`.
 */
export const extractGameNickname = ({
  rawMessage,
  gameConfig,
  commandNames,
}: ExtractGameNicknameArgs): string | null => {
  if (!gameConfig) return null

  const regex = getGameRegex(gameConfig.key)
  if (!regex) return null

  const words = rawMessage.trim().split(/\s+/)
  const firstWord = words[0]
  if (!firstWord) return null

  const normalizedFirstWord = firstWord.toLowerCase()
  const isCommand = commandNames.some(name => name.toLowerCase() === normalizedFirstWord)
  const candidates = isCommand ? words.slice(1) : words

  for (const word of candidates) {
    if (word.length <= QUEUE_NICKNAME_MAX_LENGTH && regex.test(word)) {
      return word
    }
  }

  return null
}
