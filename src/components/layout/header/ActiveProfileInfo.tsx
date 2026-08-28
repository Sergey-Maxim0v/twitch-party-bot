import type { FC } from 'react'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'

export interface ActiveProfileInfo {
  className?: string;
}

const ActiveProfileInfo: FC<ActiveProfileInfo> = ({ className = '' }) => {
  const {
    session,
    activeChannel,
    activeChannelDisplayName,
    activeChannelAvatar,
    userDisplayName,
    userAvatar,
  } = useAuth()

  return (
    <div className={`flex items-center gap-1.5 normal-case ${className}`}>

      {/* Канал */}
      <span className="flex items-center gap-1.5">
        <span className="text-xs opacity-60 font-medium">канал:</span>
        <span className="flex items-center gap-1 font-bold text-primary max-w-48 truncate">
          {activeChannelAvatar && (
            <div className="avatar shrink-0">
              <div className="w-4 h-4 rounded-full ring-1 ring-primary/20 overflow-hidden">
                <img
                  alt={activeChannelDisplayName || 'Аватар канала'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  src={activeChannelAvatar}
                />
              </div>
            </div>
          )}
          <span className="truncate">{activeChannelDisplayName || activeChannel || session?.login}</span>
        </span>
      </span>

      {/* Разделитель */}
      <span className="opacity-30 mx-0.5">|</span>

      {/* Аккаунт */}
      <span className="flex items-center gap-1.5">
        <span className="text-xs opacity-60 font-medium">аккаунт:</span>
        <span className="flex items-center gap-1 font-bold text-base-content max-w-48 truncate">
          {userAvatar && (
            <div className="avatar shrink-0">
              <div className="w-4 h-4 rounded-full ring-1 ring-base-content/20 overflow-hidden">
                <img
                  alt={userDisplayName || session?.login || 'Аватар пользователя'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  src={userAvatar}
                />
              </div>
            </div>
          )}
          <span className="truncate">{userDisplayName || session?.login}</span>
        </span>
      </span>
    </div>
  )
}

export default ActiveProfileInfo
