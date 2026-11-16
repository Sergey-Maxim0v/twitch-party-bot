import type { ReactNode } from 'react'
import type { ErrorRecord } from '../../utils/errorReporter.ts'

/**
 * Свойства границы ошибок.
 */
export interface ErrorBoundaryProps {
  /** Содержимое, защищаемое границей. */
  children: ReactNode;
  /** Компактный вид экрана восстановления для панелей. */
  compact?: boolean;
  /** Название защищаемой зоны интерфейса. */
  label?: string;
}

/**
 * Состояние границы ошибок.
 */
export interface ErrorBoundaryState {
  /** Пойманная ошибка. */
  error: Error | null;
  /** Произошла ли ошибка при отрисовке. */
  hasError: boolean;
}

/**
 * Свойства экрана восстановления после ошибки.
 */
export interface ErrorFallbackProps {
  /** Название защищаемой зоны интерфейса. */
  label?: string;
  /** Перезагрузка страницы. */
  onReload: () => void;
  /** Повторная попытка отрисовать содержимое. */
  onRetry: () => void;
  /** Журнал ошибок сессии, начиная с текущей ошибки. */
  records: ErrorRecord[];
}

/**
 * Свойства кнопок экрана восстановления.
 */
export interface ErrorFallbackActionsProps {
  /** Компактный вид кнопок для панелей. */
  compact?: boolean;
  /** Перезагрузка страницы. */
  onReload: () => void;
  /** Повторная попытка отрисовать содержимое. */
  onRetry: () => void;
}
