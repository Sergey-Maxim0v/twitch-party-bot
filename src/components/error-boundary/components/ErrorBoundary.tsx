import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ERROR_SOURCES } from '../../../constants/error.constants.ts'
import { reportError } from '../../../utils/errorReporter.ts'
import type { ErrorBoundaryProps, ErrorBoundaryState } from '../types.ts'
import { createErrorTrail } from '../utils/createErrorTrail.ts'
import { CompactErrorFallback } from './CompactErrorFallback.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

/**
 * Граница ошибок: перехватывает исключения при отрисовке и показывает экран восстановления
 * вместо пустой страницы.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
    hasError: false,
  }

  /**
   * Источник ошибок защищаемой зоны для журнала.
   */
  private get source(): string {
    return this.props.label ?? ERROR_SOURCES.APP
  }

  /**
   * Запоминает ошибку, чтобы отрисовать экран восстановления.
   *
   * @param error - Пойманная ошибка.
   * @returns Новое состояние границы.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true }
  }

  /**
   * Сообщает о пойманной ошибке.
   *
   * @param error - Пойманная ошибка.
   * @param errorInfo - Дополнительные сведения React.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, this.source, errorInfo.componentStack)
  }

  /**
   * Повторно отрисовывает защищаемое содержимое.
   */
  private handleRetry = (): void => {
    this.setState({ error: null, hasError: false })
  }

  /**
   * Перезагружает страницу.
   */
  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    const { children, compact, label } = this.props
    const { error, hasError } = this.state

    if (!hasError || !error) return children

    const fallbackProps = {
      label,
      onReload: this.handleReload,
      onRetry: this.handleRetry,
      records: createErrorTrail(error, this.source),
    }

    if (compact) return <CompactErrorFallback {...fallbackProps} />

    return <ErrorFallback {...fallbackProps} />
  }
}
