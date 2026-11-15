import { TWITCH_CSS_COLOR_PATTERN, TWITCH_HEX_COLOR_PATTERN } from '../../../constants/twitch.constants.ts'

/**
 * Проверяет, что значение можно безопасно использовать как цвет ника.
 * Поддерживаются HEX-цвета (в том числе без решетки) и корректные CSS-цвета.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение является безопасным цветом.
 */
export const isSafeTwitchColor = (value: string): boolean => {
  const trimmed = value.trim()
  return TWITCH_HEX_COLOR_PATTERN.test(trimmed) || TWITCH_CSS_COLOR_PATTERN.test(trimmed)
}
