import { type FC, useCallback, useState, type MouseEvent } from 'react'
import { LuUserRoundPlus } from 'react-icons/lu'
import { useQueue } from '../hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'

export interface QueueFormProps {
  className?: string;
}

const QueueForm: FC<QueueFormProps> = ({ className = '' }) => {
  const { addPlayerToQueue } = useQueue()
  const { session } = useAuth()

  const [username, setUsername] = useState<string>('')
  const [messageText, setMessageText] = useState<string>('')

  const handleAddPlayer = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const trimmedUsername = username.trim()
    if (!trimmedUsername) return

    const generatedId = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const lowerCaseUser = trimmedUsername.toLowerCase()

    const playerData = {
      id: generatedId,
      user: lowerCaseUser,
      displayName: trimmedUsername,
      text: messageText.trim(),
      isSystem: false,
      isChannelEvent: false,
      username: lowerCaseUser,
      userId: `manual-id-${generatedId}`,
      isSubscriber: false,
      rawMessage: messageText.trim(),
    }

    addPlayerToQueue({
      playerData,
      source: LOG_SOURCE.STREAMER_UI,
      actorUsername: session?.login ?? '',
      rawCommand: 'Ручное добавление в очередь',
      customTimestamp: Date.now(),
    })

    setUsername('')
    setMessageText('')
  }, [username, messageText, session?.login, addPlayerToQueue])

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-col gap-2 w-full">
        <input
          className="input input-bordered input-sm w-full font-medium focus:outline-none"
          onChange={e => { setUsername(e.target.value) }}
          placeholder="Никнейм Twitch..."
          required
          type="text"
          value={username}
        />
        <input
          className="input input-bordered input-sm w-full focus:outline-none"
          onChange={e => { setMessageText(e.target.value) }}
          placeholder="Сообщение или игровой ник..."
          type="text"
          value={messageText}
        />
      </div>

      <button
        className="btn btn-primary btn-outline btn-sm w-full font-semibold flex items-center justify-center gap-1.5"
        disabled={!username.trim()}
        onClick={handleAddPlayer}
        type="button"
      >
        <LuUserRoundPlus className="w-4 h-4 shrink-0" />
        <span>Добавить в очередь</span>
      </button>
    </div>
  )
}

export default QueueForm
