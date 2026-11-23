import { type FC } from 'react'
import { ThemeToggle } from './ThemeToggle.tsx'
import { LuTwitch } from 'react-icons/lu'
import { ActiveProfileInfo } from './ActiveProfileInfo.tsx'
import { ConnectionStatusPanel } from './ConnectionStatusPanel.tsx'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'
import { ChannelSelectToggle } from '../../../features/auth/components/ChannelSelectToggle.tsx'
import { LogoutToggle } from '../../../features/auth/components/LogoutToggle.tsx'
import { Version } from './Version.tsx'

/**
 * Шапка приложения: логотип, состояние подключения, профиль и меню аккаунта.
 */
export const Header: FC = () => {
  const { session, isAuthenticated, isLoading, login } = useAuth()

  return (
    <header
      className="navbar relative z-50 min-h-14 py-2 bg-base-200/80 backdrop-blur-md border-b border-base-content/10 px-6 flex justify-between items-center select-none"
    >
      <div className="flex items-end gap-2 h-7">
        <LuTwitch className="text-2xl font-black text-primary self-center" />
        <span className="hidden sm:inline text-xl font-black tracking-tight text-primary leading-none">
          Twitch Party Bot
        </span>
        <Version className="hidden md:inline-block ml-1" />
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <button aria-label="Загрузка" className="btn btn-ghost btn-sm disabled">
            <span className="loading loading-spinner loading-xs"></span>
          </button>
        ) : isAuthenticated && session ? (
          <div className="flex flex-col lg:flex-row items-end lg:items-center gap-2 lg:gap-4">
            <ConnectionStatusPanel />

            <div className="dropdown dropdown-end">
              <div
                className="btn btn-ghost btn-sm h-8 min-h-8 flex items-center gap-1.5 normal-case px-3 rounded-xl
                        bg-base-content/6 hover:bg-base-content/12 transition-colors text-sm font-medium
                        text-base-content border border-base-content/10"
                role="button"
                tabIndex={0}
              >
                <ActiveProfileInfo />
              </div>

              <ul
                className="dropdown-content menu p-1.5 bg-base-200 rounded-xl w-88 gap-1 z-50 mt-2
                   border border-base-content/15 right-0
                   shadow-[0_12px_24px_-4px_rgba(0,0,0,0.35)] [:where([data-theme=dim])_&]:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.75)]"
                tabIndex={0}
              >
                <li className="p-0">
                  <ChannelSelectToggle />
                </li>

                <li className="p-0">
                  <ThemeToggle />
                </li>

                <li className="p-0">
                  <LogoutToggle />
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="btn btn-primary btn-sm rounded-xl flex items-center gap-2"
              onClick={login}
            >
              <LuTwitch className="text-lg" />
              <span>Войти</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
