import { type FC } from 'react'
import { LuClockAlert, LuTwitch } from 'react-icons/lu'
import { useAuth } from '../../features/auth/hooks/useAuth.ts'
import { TWITCH_AUTH_UI_MESSAGES } from '../../constants/auth.constants.ts'

/**
 * Экран-приглашение к авторизации через Twitch.
 * При истечении сессии показывает пояснение.
 */
export const WelcomeScreen: FC = () => {
  const { login, isStoragePersistent, isSessionExpired } = useAuth()

  return (
    <div className="flex h-full items-center justify-center p-6 bg-base-100">
      <div className="max-w-md text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
          <LuTwitch className="text-4xl animate-pulse" />
        </div>

        <h2 className="text-3xl font-black tracking-tight text-base-content">
          Twitch Party Queue
        </h2>

        <p className="text-sm text-base-content/60 leading-relaxed max-w-sm">
          Собирайте зрителей в пати для совместных игр прямо во время стрима. Управляйте очередью, модерируйте
          заявки и играйте вместе без лишней рутины.
        </p>

        {isSessionExpired && (
          <div className="alert alert-warning w-full text-left" role="alert">
            <LuClockAlert className="text-lg shrink-0" />
            <span className="text-sm">
              {TWITCH_AUTH_UI_MESSAGES.SESSION_EXPIRED}
            </span>
          </div>
        )}

        <button
          className="btn btn-primary mt-2 flex items-center gap-2"
          onClick={login}
        >
          <LuTwitch className="text-lg" />
          Авторизоваться через Twitch
        </button>

        {!isStoragePersistent && (
          <p className="text-xs text-warning max-w-sm">
            {TWITCH_AUTH_UI_MESSAGES.STORAGE_PERSISTENCE_UNAVAILABLE}
          </p>
        )}
      </div>
    </div>
  )
}
