import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { clearLegacyAuthSession } from './features/auth/utils/clearLegacyAuthSession.ts'

clearLegacyAuthSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
