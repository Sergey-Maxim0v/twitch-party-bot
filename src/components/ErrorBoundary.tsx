import { Component, type ErrorInfo, type ReactNode } from 'react'
import { LuRotateCcw, LuTriangleAlert } from 'react-icons/lu'
import { ERROR_SCREEN_TEXTS, ERROR_SOURCES } from '../constants/error.constants.ts'
import { createErrorRecord, readErrorTrail, reportError, type ErrorRecord } from '../utils/errorReporter.ts'
import { formatTimeWithSeconds } from '../utils/dateTime.ts'

interface ErrorBoundaryProps {
  /** Содержимое, защищаемое границей. */
  children: ReactNode;
  /** Название защищаемой зоны интерфейса. */
  label?: string;
  /** Компактный вид экрана восстановления для панелей. */
  compact?: boolean;
}

interface ErrorBoundaryState {
  /** Произошла ли ошибка при отрисовке. */
  hasError: boolean;
  /** Пойманная ошибка. */
  error: Error | null;
}

interface ErrorFallbackProps {
  /** Журнал ошибок сессии, начиная с текущей ошибки. */
  records: ErrorRecord[];
  /** Название защищаемой зоны интерфейса. */
  label?: string;
  /** Компактный вид экрана восстановления для панелей. */
  compact?: boolean;
  /** Повторная попытка отрисовать содержимое. */
  onRetry: () => void;
  /** Перезагрузка страницы. */
  onReload: () => void;
}

/**
 * Экран восстановления после ошибки: сообщает о проблеме и предлагает повторить попытку.
 */
const ErrorFallback = ({ records, label, compact, onRetry, onReload }: ErrorFallbackProps) => {
  const currentRecord = records[0]

  if (compact) {
    return (
      <div className="flex flex-col gap-2 p-3 overflow-y-auto text-xs text-base-content/70">
        <div className="alert alert-error alert-sm py-2">
          <LuTriangleAlert className="w-4 h-4 shrink-0" />
          <span className="font-semibold truncate">{label ?? ERROR_SCREEN_TEXTS.TITLE}</span>
        </div>

        <p className="font-mono break-all">{currentRecord?.message ?? ERROR_SCREEN_TEXTS.DESCRIPTION}</p>

        <div className="flex gap-2">
          <button className="btn btn-xs btn-primary" onClick={onRetry} type="button">
            <LuRotateCcw className="w-3 h-3" /> {ERROR_SCREEN_TEXTS.RETRY}
          </button>
          <button className="btn btn-xs btn-ghost" onClick={onReload} type="button">
            {ERROR_SCREEN_TEXTS.RELOAD}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-base-100 p-4 text-base-content">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="alert alert-error">
          <LuTriangleAlert className="w-6 h-6 shrink-0" />
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-base">{ERROR_SCREEN_TEXTS.TITLE}</h1>
            <p className="text-sm text-base-content/70">{ERROR_SCREEN_TEXTS.DESCRIPTION}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary btn-sm" onClick={onRetry} type="button">
            <LuRotateCcw className="w-4 h-4" /> {ERROR_SCREEN_TEXTS.RETRY}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onReload} type="button">
            {ERROR_SCREEN_TEXTS.RELOAD}
          </button>
        </div>

        <details className="collapse collapse-arrow bg-base-200/60 border border-base-300">
          <summary className="collapse-title text-xs font-semibold uppercase tracking-wider">
            {ERROR_SCREEN_TEXTS.DETAILS}
          </summary>

          <div className="collapse-content">
            <ul className="flex flex-col gap-3">
              {records.map(record => (
                <li className="text-xs" key={`${record.timestamp}-${record.message}`}>
                  <div className="font-mono text-base-content/60">
                    {formatTimeWithSeconds(record.timestamp)} · {record.source}
                  </div>
                  <pre className="whitespace-pre-wrap break-all font-mono text-base-content/80">
                    {record.stack ?? record.message}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </div>
  )
}

/**
 * Граница ошибок: перехватывает исключения при отрисовке и показывает экран восстановления
 * вместо пустой страницы.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
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
    return { hasError: true, error }
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
    this.setState({ hasError: false, error: null })
  }

  /**
   * Перезагружает страницу.
   */
  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    const { children, compact, label } = this.props
    const { hasError, error } = this.state

    if (!hasError || !error) return children

    return (
      <ErrorFallback
        compact={compact}
        label={label}
        onReload={this.handleReload}
        onRetry={this.handleRetry}
        records={readErrorTrail(createErrorRecord(error, this.source))}
      />
    )
  }
}
