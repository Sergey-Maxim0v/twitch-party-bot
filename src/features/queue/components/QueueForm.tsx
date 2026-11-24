import { type FC, useState, type MouseEvent } from 'react'
import { LuMessageSquare, LuUserRound, LuUserRoundPlus } from 'react-icons/lu'
import { useQueue } from '../hooks/useQueue.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { QUEUE_PLAYER_SOURCE, type QueuePlayerFormData } from '../types.ts'
import { QueueRoleToggle } from './QueueRoleToggle.tsx'
import type { ClassNameProps } from '../../../types/common.types.ts'

/**
 * Форма ручного добавления игрока в очередь.
 */
export const QueueForm: FC<ClassNameProps> = ({ className = '' }) => {
  const { addPlayerToQueue } = useQueue()
  const actorUsername = useActorUsername('')

  const [username, setUsername] = useState<string>('')
  const [messageText, setMessageText] = useState<string>('')
  const [isMod, setIsMod] = useState<boolean>(false)
  const [isSub, setIsSub] = useState<boolean>(false)
  const [isVip, setIsVip] = useState<boolean>(false)

  const handleAddPlayer = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()

    const trimmedUsername = username.trim()
    if (!trimmedUsername) return

    const timestamp = Date.now()
    const generatedId = `manual-${timestamp}-${Math.random().toString(36).substring(2, 9)}`
    const lowerCaseUser = trimmedUsername.toLowerCase()

    const playerData: QueuePlayerFormData = {
      rawMessage: messageText.trim(),
      username: lowerCaseUser,
      displayedUsername: trimmedUsername,
      userId: generatedId,
      isModerator: isMod,
      isSubscriber: isSub,
      isVip,
      playerSource: QUEUE_PLAYER_SOURCE.APP,
    }

    addPlayerToQueue({
      playerData,
      source: APP_LOG_SOURCES.STREAMER_UI,
      actorUsername,
      customTimestamp: timestamp,
    })

    setUsername('')
    setMessageText('')
    setIsSub(false)
    setIsMod(false)
    setIsVip(false)
  }

  return (
    <form className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex w-full flex-col gap-2">
        <label
          className="input input-sm h-9 w-full gap-2 rounded-xl border-base-300/70 bg-base-100/60 px-3
            text-sm transition-all focus-within:border-primary/50 focus-within:ring-2
            focus-within:ring-primary/15 focus-within:outline-none"
        >
          <LuUserRound className="h-3.5 w-3.5 shrink-0 text-base-content/35" />
          <input
            aria-label="Никнейм Twitch"
            autoComplete="off"
            className="grow border-0 bg-transparent p-0 text-sm font-medium outline-none
              placeholder:text-base-content/30 focus:outline-none"
            onChange={e => setUsername(e.target.value)}
            placeholder="Никнейм Twitch..."
            required
            type="text"
            value={username}
          />
        </label>

        <label
          className="input input-sm h-9 w-full gap-2 rounded-xl border-base-300/70 bg-base-100/60 px-3
            text-sm transition-all focus-within:border-primary/50 focus-within:ring-2
            focus-within:ring-primary/15 focus-within:outline-none"
        >
          <LuMessageSquare className="h-3.5 w-3.5 shrink-0 text-base-content/35" />
          <input
            aria-label="Сообщение или игровой ник"
            autoComplete="off"
            className="grow border-0 bg-transparent p-0 text-sm outline-none
              placeholder:text-base-content/30 focus:outline-none"
            onChange={e => setMessageText(e.target.value)}
            placeholder="Сообщение или игровой ник..."
            type="text"
            value={messageText}
          />
        </label>
      </div>

      <div className="flex flex-row items-center gap-1.5">
        <QueueRoleToggle checked={isMod} label="Mod" onChange={setIsMod} toggleClassName="toggle-success" />
        <QueueRoleToggle checked={isSub} label="Sub" onChange={setIsSub} toggleClassName="toggle-primary" />
        <QueueRoleToggle checked={isVip} label="VIP" onChange={setIsVip} toggleClassName="toggle-warning" />
      </div>

      <button
        className="btn btn-primary btn-sm h-9 min-h-9 w-full gap-2 rounded-xl border-0 font-semibold
          shadow-sm shadow-primary/20 transition-all duration-200 hover:shadow-md hover:brightness-105
          active:scale-[0.99] disabled:bg-base-300 disabled:text-base-content/35 disabled:shadow-none"
        disabled={!username.trim()}
        onClick={handleAddPlayer}
        type="submit"
      >
        <LuUserRoundPlus className="h-4 w-4 shrink-0" />
        <span>Добавить в очередь</span>
      </button>
    </form>
  )
}
