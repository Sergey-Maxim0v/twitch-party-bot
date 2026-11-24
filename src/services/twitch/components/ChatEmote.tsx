import { type FC, useState } from 'react'
import {
  TWITCH_EMOTE_IMAGE_BASE_URL,
  TWITCH_EMOTE_IMAGE_VARIANT,
} from '../../../constants/twitch.constants.ts'
import type { TwitchEmote } from '../types.ts'

type ChatEmoteProps = TwitchEmote

/**
 * Показывает эмоцию Twitch картинкой, а при ошибке загрузки — её названием.
 */
export const ChatEmote: FC<ChatEmoteProps> = ({ id, name }) => {
  const [isFallback, setIsFallback] = useState(false)

  if (isFallback) return <>{name}</>

  return (
    <img
      alt={name}
      className="inline align-middle h-6 w-auto"
      decoding="async"
      loading="lazy"
      onError={() => setIsFallback(true)}
      src={`${TWITCH_EMOTE_IMAGE_BASE_URL}/${id}/${TWITCH_EMOTE_IMAGE_VARIANT}`}
      title={name}
    />
  )
}
