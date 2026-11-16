import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/error-boundary/components/ErrorBoundary.tsx'
import { ERROR_SOURCES } from './constants/error.constants.ts'
import { clearLegacyAuthSession } from './features/auth/utils/clearLegacyAuthSession.ts'
import { installGlobalErrorHandlers, reportError } from './utils/errorReporter.ts'

clearLegacyAuthSession()
installGlobalErrorHandlers()

createRoot(document.getElementById('root')!, {
  onUncaughtError: error => reportError(error, ERROR_SOURCES.REACT),
}).render(
  <StrictMode>
    <ErrorBoundary label={ERROR_SOURCES.APP}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
