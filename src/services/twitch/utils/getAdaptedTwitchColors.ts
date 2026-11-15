import { TWITCH_COLOR_LIGHTNESS } from '../../../constants/twitch.constants.ts'
import { hexToHsl } from './hexToHsl.ts'
import { isSafeTwitchColor } from './isSafeTwitchColor.ts'

export interface AdaptedColors {
  lightColor: string;
  darkColor: string;
}

/**
 * Адаптирует исходный цвет Twitch под требования контрастности для светлой и темной тем.
 * Сохраняет оригинальный оттенок и насыщенность, корректируя только яркость.
 * Цвет, который не удается сконвертировать в HSL, используется как есть.
 *
 * @param color - Исходный цвет ника.
 * @returns Цвета для светлой и темной тем или `null`, если значение не является безопасным цветом.
 */
export const getAdaptedTwitchColors = (color: string): AdaptedColors | null => {
  const trimmed = color.trim()
  const hsl = hexToHsl(trimmed)

  if (!hsl) {
    return isSafeTwitchColor(trimmed) ? { lightColor: trimmed, darkColor: trimmed } : null
  }

  const lightLightness = hsl.l > TWITCH_COLOR_LIGHTNESS.LIGHT_THEME_MAX
    ? TWITCH_COLOR_LIGHTNESS.LIGHT_THEME_VALUE
    : hsl.l
  const darkLightness = hsl.l < TWITCH_COLOR_LIGHTNESS.DARK_THEME_MIN
    ? TWITCH_COLOR_LIGHTNESS.DARK_THEME_VALUE
    : hsl.l

  return {
    lightColor: `hsl(${hsl.h}, ${hsl.s}%, ${lightLightness}%)`,
    darkColor: `hsl(${hsl.h}, ${hsl.s}%, ${darkLightness}%)`,
  }
}
