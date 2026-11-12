import { type FC } from 'react'
import { LuGem, LuHeart, LuSword, LuTwitch } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { Avatar } from '../../../components/Avatar.tsx'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useChannelInfo } from '../hooks/useChannelInfo.ts'
import type { ChannelRoles } from '../types'

interface RoleBadgeConfig {
  /** Ключ роли в наборе ролей аккаунта. */
  key: keyof ChannelRoles;
  /** Название роли для интерфейса. */
  label: string;
  /** Иконка роли. */
  icon: IconType;
  /** CSS-классы бейджа в стиле DaisyUI. */
  className: string;
}

/**
 * Оформление бейджей ролей аккаунта в канале.
 */
const ROLE_BADGES: RoleBadgeConfig[] = [
  { key: 'isBroadcaster', label: 'Broadcaster', icon: LuTwitch, className: 'badge-error badge-soft' },
  { key: 'isModerator', label: 'Модератор', icon: LuSword, className: 'badge-success badge-soft' },
  { key: 'isVip', label: 'VIP', icon: LuGem, className: 'badge-info badge-soft' },
  { key: 'isSubscriber', label: 'Подписчик', icon: LuHeart, className: 'badge-secondary badge-soft' },
]

/**
 * Карточка со сведениями о текущем канале: название, роли аккаунта и ограничения чата.
 */
export const ChannelInfoCard: FC = () => {
  const { activeChannelAvatar, activeChannelDisplayName } = useAuth()
  const { channel, hasRolesData, isConnected, restrictions, roles } = useChannelInfo()

  const activeRoles = ROLE_BADGES.filter(role => roles[role.key])
  const channelName = activeChannelDisplayName || channel || ''
  const isChannelActive = isConnected && !!channel
  const isRolesPending = !hasRolesData
  const isGuest = hasRolesData && activeRoles.length === 0
  const hasNoRestrictions = restrictions.length === 0

  return (
    <div className="card card-sm bg-base-200/60 border border-base-300/70 w-full">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="card-title text-sm font-bold">Текущий канал</h4>
          <span className={`badge badge-sm ${isConnected ? 'badge-success badge-soft' : 'badge-ghost'}`}>
            {isConnected ? 'Подключен' : 'Не подключен'}
          </span>
        </div>

        {!isChannelActive && (
          <p className="text-sm text-base-content/60">
            Канал не подключён. Подключите канал, чтобы увидеть роли и ограничения чата.
          </p>
        )}

        {isChannelActive && (
          <>
            <div className="flex items-center gap-2 min-w-0">
              {activeChannelAvatar && (
                <Avatar
                  alt={channelName || 'Аватар канала'}
                  ringClassName="ring-primary/20"
                  src={activeChannelAvatar}
                />
              )}
              <span className="font-bold text-base-content truncate">{channelName}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                Роли
              </span>

              <div className="flex flex-wrap gap-1">
                {isRolesPending && (
                  <span className="text-xs text-base-content/50">Определяются…</span>
                )}

                {isGuest && (
                  <span className="badge badge-sm badge-ghost badge-soft">Гость</span>
                )}

                {activeRoles.map(role => (
                  <span className={`badge badge-sm ${role.className} gap-1`} key={role.key}>
                    <role.icon className="w-3.5 h-3.5" />
                    {role.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                Ограничения чата
              </span>

              <div className="flex flex-wrap gap-1">
                {hasNoRestrictions && (
                  <span className="badge badge-sm badge-ghost badge-soft">Без ограничений</span>
                )}

                {restrictions.map(restriction => (
                  <span
                    className="badge badge-sm badge-warning badge-soft tooltip"
                    data-tip={restriction.description}
                    key={restriction.tag}
                  >
                    {restriction.title}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
