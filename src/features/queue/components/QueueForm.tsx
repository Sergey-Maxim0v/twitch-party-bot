import { type FC, useState, type MouseEvent } from 'react'
import { LuUserRoundPlus } from 'react-icons/lu'
import { useQueue } from '../hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import type { QueuePlayerFormData } from '../types.ts'

export interface QueueFormProps {
  className?: string;
}

const QueueForm: FC<QueueFormProps> = ({ className = '' }) => {
  const { addPlayerToQueue } = useQueue()
  const { session } = useAuth()

  const [username, setUsername] = useState<string>('')
  const [messageText, setMessageText] = useState<string>('')
  const [isMod, setIsMod] = useState<boolean>(false)
  const [isSub, setIsSub] = useState<boolean>(false)
  const [isVip, setIsVip] = useState<boolean>(false)

  const handleAddPlayer = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const trimmedUsername = username.trim()
    if (!trimmedUsername) return

    const timestamp = Date.now()
    const generatedId = `manual-${timestamp}-${Math.random().toString(36).substring(2, 9)}`
    const lowerCaseUser = trimmedUsername.toLowerCase()

    const playerData: QueuePlayerFormData = {
      rawMessage: messageText.trim(),
      username: lowerCaseUser,
      userId: generatedId,
      isModerator: isMod,
      isSubscriber: isSub,
      isVip,
    }

    addPlayerToQueue({
      playerData,
      source: LOG_SOURCE.STREAMER_UI,
      actorUsername: session?.login ?? '',
      rawCommand: 'Ручное добавление в очередь',
      customTimestamp: timestamp,
    })

    setUsername('')
    setMessageText('')
    setIsSub(false)
    setIsMod(false)
    setIsVip(false)
  }

  return (
    <form className={`flex flex-col gap-2 ${className}`}>
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

      <div className="flex flex-row items-center gap-4 px-1">
        <div className="form-control">
          <label className="label cursor-pointer gap-2 py-1 hover:text-primary transition-all justify-center">
            <span className="label-text font-semibold text-xs select-none">Mod</span>
            <input
              checked={isMod}
              className="checkbox checkbox-primary checkbox-sm"
              onChange={e => setIsMod(e.target.checked)}
              type="checkbox"
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer gap-2 py-1 hover:text-primary transition-all justify-center">
            <span className="label-text font-semibold text-xs select-none">Sub</span>
            <input
              checked={isSub}
              className="checkbox checkbox-primary checkbox-sm"
              onChange={e => setIsSub(e.target.checked)}
              type="checkbox"
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer gap-2 py-1 hover:text-primary transition-all justify-center">
            <span className="label-text font-semibold text-xs select-none">VIP</span>
            <input
              checked={isVip}
              className="checkbox checkbox-primary checkbox-sm"
              onChange={e => setIsVip(e.target.checked)}
              type="checkbox"
            />
          </label>
        </div>
      </div>

      <button
        className="btn btn-primary btn-outline btn-sm w-full font-semibold flex items-center justify-center gap-1.5"
        disabled={!username.trim()}
        onClick={handleAddPlayer}
        type="submit"
      >
        <LuUserRoundPlus className="w-4 h-4 shrink-0" />
        <span>Добавить в очередь</span>
      </button>
    </form>
  )
}

export default QueueForm
