import { type FC } from 'react'
import { Header } from './header/Header.tsx'
import { AuthModal } from '../../features/auth/components/AuthModal.tsx'
import { ChannelSelectModal } from '../../features/auth/components/ChannelSelectModal.tsx'
import type { ChildrenProps } from '../../types/common.types.ts'

/**
 * Общий каркас страницы: шапка, область контента и модальные окна авторизации.
 */
export const PageLayout: FC<ChildrenProps> = ({ children }) => (
  <div
    className="h-screen w-screen flex flex-col bg-base-100 text-base-content antialiased transition-colors duration-200"
  >
    <Header />

    <main className="flex-1 w-full overflow-hidden flex flex-col">
      {children}
    </main>

    <AuthModal />
    <ChannelSelectModal />
  </div>
)
