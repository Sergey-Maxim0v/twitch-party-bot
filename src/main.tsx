import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/error-boundary/components/ErrorBoundary.tsx'
import { FrameBlockedScreen } from './components/FrameBlockedScreen.tsx'
import { ERROR_SOURCES } from './constants/error.constants.ts'
import { clearLegacyAuthSession } from './features/auth/utils/clearLegacyAuthSession.ts'
import { installGlobalErrorHandlers, reportError } from './utils/errorReporter.ts'
import { isFramed } from './utils/isFramed.ts'

const root = createRoot(document.getElementById('root')!, {
  onUncaughtError: error => reportError(error, ERROR_SOURCES.REACT),
})

if (isFramed()) {
  root.render(<FrameBlockedScreen />)
} else {
  clearLegacyAuthSession()
  installGlobalErrorHandlers()

  root.render(
    <StrictMode>
      <ErrorBoundary label={ERROR_SOURCES.APP}>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
