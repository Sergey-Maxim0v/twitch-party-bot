import { TWITCH_HEX_COLOR_PATTERN } from '../../../constants/twitch.constants.ts'

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

/**
 * Разворачивает сокращенный HEX-цвет (`#abc`) в полный (`#aabbcc`).
 *
 * @param hex - Три или шесть HEX-символов без решетки.
 * @returns Полный шестизначный HEX-цвет.
 */
const expandHex = (hex: string): string => (
  hex.length === 3 ? hex.replace(/./g, char => char + char) : hex
)

/**
 * Рассчитывает оттенок по каналам RGB.
 *
 * @param r - Красный канал в диапазоне 0..1.
 * @param g - Зеленый канал в диапазоне 0..1.
 * @param b - Синий канал в диапазоне 0..1.
 * @param max - Максимальный канал.
 * @param delta - Разница максимального и минимального каналов.
 * @returns Оттенок в диапазоне 0..1.
 */
const getHue = (r: number, g: number, b: number, max: number, delta: number): number => {
  if (max === r) return ((g - b) / delta + (g < b ? 6 : 0)) / 6
  if (max === g) return ((b - r) / delta + 2) / 6
  return ((r - g) / delta + 4) / 6
}

/**
 * Конвертирует HEX-строку в компоненты HSL.
 *
 * @param hex - HEX-цвет в формате `#RRGGBB`, `#RGB` или без решетки.
 * @returns Компоненты оттенка, насыщенности и яркости или `null`, если значение не является HEX-цветом.
 */
export const hexToHsl = (hex: string): HslColor | null => {
  const match = TWITCH_HEX_COLOR_PATTERN.exec(hex.trim())

  if (!match) return null

  const normalized = expandHex(match[1])
  const r = parseInt(normalized.substring(0, 2), 16) / 255
  const g = parseInt(normalized.substring(2, 4), 16) / 255
  const b = parseInt(normalized.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2

  if (max === min) return { h: 0, s: 0, l: Math.round(lightness * 100) }

  const delta = max - min
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  const hue = getHue(r, g, b, max, delta)

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  }
}
