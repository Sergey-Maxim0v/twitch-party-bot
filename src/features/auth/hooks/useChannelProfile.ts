import { useEffect, useState } from 'react'
import { TWITCH_CHANNEL_PROFILE_STATUSES } from '../../../constants/auth.constants.ts'
import { getTwitchChannelProfile, type TwitchChannelData } from '../utils/getTwitchChannelProfile.ts'

interface UseChannelProfileParams {
  channel: string | null;
  accessToken: string | undefined;
  onUnauthorized: () => void;
}

/**
 * Получает отображаемое имя и аватар канала в фоне.
 *
 * @param params - Канал, токен и обработчик отклонённого токена.
 * @returns Имя и аватар либо `null`, пока данных нет.
 */
export const useChannelProfile = ({ channel, accessToken, onUnauthorized }: UseChannelProfileParams) => {
  const [profile, setProfile] = useState<TwitchChannelData | null>(null)

  useEffect(() => {
    if (!channel || !accessToken) return

    let isMounted = true

    const fetchProfileData = async () => {
      const result = await getTwitchChannelProfile(channel, accessToken)

      if (!isMounted) return

      if (result.status === TWITCH_CHANNEL_PROFILE_STATUSES.UNAUTHORIZED) {
        onUnauthorized()
        return
      }

      if (result.status === TWITCH_CHANNEL_PROFILE_STATUSES.FOUND) {
        setProfile(result.data)
      }
    }

    void fetchProfileData()

    return () => {
      isMounted = false
    }
  }, [channel, accessToken, onUnauthorized])

  const isProfileValid = profile && channel && profile.login === channel.toLowerCase() && accessToken

  return {
    displayName: isProfileValid ? profile.displayName : null,
    avatarUrl: isProfileValid ? profile.profileImageUrl : null,
  }
}
