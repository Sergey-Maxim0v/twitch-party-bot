import { type FC, type ReactNode } from 'react'
import { SETTINGS_SECTION_CLASS, SETTINGS_SECTION_SPACED_CLASS } from '../../../constants/ui.constants.ts'
import type { SettingsSectionProps } from '../types.ts'

interface SettingsSectionLayoutProps extends SettingsSectionProps {
  /** Заголовок секции. */
  title: string;
  /** Использовать увеличенные отступы между элементами. */
  spaced?: boolean;
  /** Содержимое секции. */
  children: ReactNode;
}

/**
 * Общая обёртка секции панели настроек: заголовок и стилизованный контейнер.
 */
export const SettingsSection: FC<SettingsSectionLayoutProps> = ({
  title,
  titleClassName = '',
  className = '',
  spaced = false,
  children,
}) => {
  const sectionClass = spaced ? SETTINGS_SECTION_SPACED_CLASS : SETTINGS_SECTION_CLASS

  return (
    <div className={`${sectionClass} ${className}`}>
      <h3 className={titleClassName}>{title}</h3>
      {children}
    </div>
  )
}
