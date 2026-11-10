import { hexToHsl } from './hexToHsl.ts'

interface AdaptedColors {
  lightColor: string;
  darkColor: string;
}

/**
 * Адаптирует исходный цвет Twitch под требования контрастности для светлой и темной тем.
 * Сохраняет оригинальный оттенок и насыщенность, корректируя только яркость.
 * @param hexColor - Исходный HEX-цвет никнейма.
 * @returns Цвета для светлой и темной тем в формате HSL.
 */
export const getAdaptedTwitchColors = (hexColor: string): AdaptedColors => {
  const { h, s, l } = hexToHsl(hexColor)

  const lightL = l > 45 ? 38 : l
  const darkL = l < 60 ? 72 : l

  return {
    lightColor: `hsl(${h}, ${s}%, ${lightL}%)`,
    darkColor: `hsl(${h}, ${s}%, ${darkL}%)`,
  }
}
