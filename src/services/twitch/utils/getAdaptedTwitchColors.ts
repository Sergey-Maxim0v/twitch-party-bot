import { hexToHsl } from './hexToHsl.ts'

export interface AdaptedColors {
  lightColor: string;
  darkColor: string;
}

/**
 * Адаптирует исходный цвет Twitch под требования контрастности для светлой и темной тем.
 * Сохраняет оригинальный оттенок (Hue) и насыщенность (Saturation), корректируя только яркость (Lightness).
 */
export const getAdaptedTwitchColors = (hexColor: string): AdaptedColors => {
  const { h, s, l } = hexToHsl(hexColor)

  // Для светлой темы: если цвет слишком яркий/бледный, занижаем яркость до 38%
  const lightL = l > 45 ? 38 : l

  // Для темной темы: если цвет слишком темный, повышаем яркость до 72%
  const darkL = l < 60 ? 72 : l

  return {
    lightColor: `hsl(${h}, ${s}%, ${lightL}%)`,
    darkColor: `hsl(${h}, ${s}%, ${darkL}%)`,
  }
}
