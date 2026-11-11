import type { FC } from 'react'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'
import { Avatar } from '../../Avatar.tsx'

interface ActiveProfileInfoProps {
  /** Дополнительные CSS-классы контейнера. */
  className?: string;
}

/**
 * Краткая информация об активном канале и текущем аккаунте.
 */
export const ActiveProfileInfo: FC<ActiveProfileInfoProps> = ({ className = '' }) => {
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
      <span className="flex items-center gap-1.5">
        <span className="text-xs opacity-60 font-medium">канал:</span>
        <span className="flex items-center gap-1 font-bold text-primary max-w-48 truncate">
          {activeChannelAvatar && (
            <Avatar
              alt={activeChannelDisplayName || 'Аватар канала'}
              ringClassName="ring-primary/20"
              src={activeChannelAvatar}
            />
          )}
          <span className="truncate">{activeChannelDisplayName || activeChannel || session?.login}</span>
        </span>
      </span>

      <span className="opacity-30 mx-0.5">|</span>

      <span className="flex items-center gap-1.5">
        <span className="text-xs opacity-60 font-medium">аккаунт:</span>
        <span className="flex items-center gap-1 font-bold text-base-content max-w-48 truncate">
          {userAvatar && (
            <Avatar alt={userDisplayName || session?.login || 'Аватар пользователя'} src={userAvatar} />
          )}
          <span className="truncate">{userDisplayName || session?.login}</span>
        </span>
      </span>
    </div>
  )
}
