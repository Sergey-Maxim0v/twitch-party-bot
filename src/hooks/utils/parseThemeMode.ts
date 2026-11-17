import { DEFAULT_THEME_MODE, THEME_OPTIONS } from '../../constants/theme.constants.ts'
import type { SanitizedValue } from '../types/storage.types.ts'
import type { ThemeMode } from '../types/theme.types.ts'

/**
 * Проверяет сохранённый режим темы.
 *
 * @param value - Значение из хранилища.
 * @returns Режим темы или значение по умолчанию и признак некорректного значения.
 */
export const parseThemeMode = (value: unknown): SanitizedValue<ThemeMode> => {
  const themeMode = THEME_OPTIONS.find(option => option.id === value)?.id

  return themeMode
    ? { value: themeMode, isInvalid: false }
    : { value: DEFAULT_THEME_MODE, isInvalid: true }
}
