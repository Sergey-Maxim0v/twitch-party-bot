import { useState, type FC, type ChangeEvent, type SyntheticEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { validateChannelName } from '../utils/validateChannelName.ts'
import { LuX } from 'react-icons/lu'
import { getChannelSelectCurrentError } from '../utils/getChannelSelectCurrentError.ts'
import {
  getTwitchChannelProfile,
  type TwitchChannelProfileFailure,
} from '../utils/getTwitchChannelProfile.ts'
import { isChannelConnectRequired } from '../utils/isChannelConnectRequired.ts'
import { TWITCH_CHANNEL_PROFILE_STATUSES } from '../../../constants/auth.constants.ts'
import { ChannelInfoCard } from '../../channel-info/components/ChannelInfoCard.tsx'
import { useEscapeKey } from '../../../hooks/useEscapeKey.ts'

/**
 * Модальное окно выбора канала чата: свой канал или ручной ввод.
 */
export const ChannelSelectModal: FC = () => {
  const {
    session,
    isAuthenticated,
    hasSelectedChannel,
    isChannelModalOpen,
    closeChannelModal,
    channelError,
    selectOwnChannel,
    selectCustomChannel,
    userDisplayName,
    expireSession,
  } = useAuth()

  const { connect, getClient } = useSocketContext()

  const [inputValue, setInputValue] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [profileFailure, setProfileFailure] = useState<TwitchChannelProfileFailure | null>(null)
  const [isValidationTriggered, setIsValidationTriggered] = useState(false)

  useEscapeKey(closeChannelModal, isChannelModalOpen && hasSelectedChannel)

  const currentError = getChannelSelectCurrentError({
    channelError,
    isValidationTriggered,
    value: inputValue,
    profileFailure,
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setProfileFailure(null)
    setIsValidationTriggered(false)
  }

  /**
   * Подключает бота к каналу, если это действительно требуется.
   *
   * @param targetChannel - Канал, к которому подключаемся.
   */
  const connectToChannel = (targetChannel: string): void => {
    if (!session?.accessToken || !session?.login) return

    const client = getClient()
    const shouldConnect = isChannelConnectRequired({
      currentChannel: client.currentChannel,
      targetChannel,
      socketReadyState: client.readyState,
    })

    if (!shouldConnect) return

    connect(targetChannel, session.accessToken, session.login)
  }

  /**
   * Проверяет канал на Twitch, выбирает его и подключает бота.
   *
   * @param channel - Имя канала.
   * @param select - Обработчик сохранения канала.
   */
  const verifyAndConnect = async (
    channel: string,
    select: (channel: string) => void,
  ): Promise<void> => {
    if (!session?.accessToken) return

    setIsChecking(true)
    setProfileFailure(null)

    try {
      const result = await getTwitchChannelProfile(channel, session.accessToken)

      if (result.status === TWITCH_CHANNEL_PROFILE_STATUSES.UNAUTHORIZED) {
        expireSession()
        return
      }

      if (result.status !== TWITCH_CHANNEL_PROFILE_STATUSES.FOUND) {
        setProfileFailure(result.status)
        return
      }

      select(channel)
      connectToChannel(channel)
    } finally {
      setIsChecking(false)
    }
  }

  /**
   * Подключает собственный канал пользователя.
   */
  const handleOwnChannelClick = async (): Promise<void> => {
    if (!session?.login || !session.accessToken || isChecking) return

    await verifyAndConnect(session.login, selectOwnChannel)
  }

  /**
   * Подключает канал, введённый вручную.
   *
   * @param e - Событие отправки формы.
   */
  const handleCustomSubmit = async (e: SyntheticEvent): Promise<void> => {
    e.preventDefault()

    if (isChecking) return

    setIsValidationTriggered(true)
    setProfileFailure(null)

    const trimmed = inputValue.trim()

    if (!trimmed || !validateChannelName(trimmed) || !session?.login || !session?.accessToken) return

    await verifyAndConnect(trimmed, selectCustomChannel)
  }

  if (!isAuthenticated || !isChannelModalOpen) return null

  const inputClassName = `input w-full ${
    currentError ? 'input-error text-error bg-error/10' : 'input-bordered'
  }`

  return (
    <div className="modal modal-open z-100">
      <div className="modal-box max-w-sm flex flex-col p-6 gap-4 relative">

        {hasSelectedChannel && !isChecking && (
          <button
            aria-label="Закрыть модальное окно"
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-base-content/70 hover:text-base-content"
            onClick={closeChannelModal}
          >
            <LuX className="text-base" />
          </button>
        )}

        <div className="text-center mt-2">
          <h3 className="font-bold text-xl text-base-content">Выбор канала</h3>
          <p className="text-sm text-base-content/60 mt-1">
            Укажите канал, сообщения которого бот должен начать отслеживать.
          </p>
        </div>

        <ChannelInfoCard />

        <button
          className="btn btn-primary w-full flex flex-col h-auto py-2.5 gap-0.5"
          disabled={isChecking}
          onClick={handleOwnChannelClick}
        >
          <span className="text-xs">Подключить канал</span>
          {session?.login && (
            <span className="font-bold text-sm">{userDisplayName ?? session.login}</span>
          )}
        </button>

        <form className="flex flex-col gap-3 w-full" onSubmit={handleCustomSubmit}>
          <div className="form-control w-full">
            <input
              autoComplete="off"
              className={inputClassName}
              disabled={isChecking}
              name="Channel-name"
              onChange={handleInputChange}
              placeholder="Название канала"
              spellCheck="false"
              type="text"
              value={inputValue}
            />
            {currentError && (
              <label className="label py-1">
                <span
                  className="label-text-alt text-error font-medium wrap-break-word
                                    whitespace-normal w-full"
                >
                  {currentError}
                </span>
              </label>
            )}
          </div>

          <button
            className="btn btn-primary btn-outline w-full btn-sm flex flex-col h-14
                        justify-center items-center py-2 gap-0.5 overflow-hidden"
            disabled={!inputValue.trim() || isChecking}
            type="submit"
          >
            {isChecking ? (
              <span className="loading loading-spinner loading-md" />
            ) : inputValue.trim() ? (
              <>
                <span className="text-xs">
                  Подключить канал
                </span>
                <span className="font-bold text-sm truncate max-w-full">
                  {inputValue}
                </span>
              </>
            ) : (
              <span className="font-bold text-sm">
                Введите название
              </span>
            )}
          </button>
        </form>
      </div>

      <div
        className={`modal-backdrop bg-black/40 backdrop-blur-xs ${hasSelectedChannel && !isChecking ? 'cursor-pointer' : ''}`}
        onClick={hasSelectedChannel && !isChecking ? closeChannelModal : undefined}
      />
    </div>
  )
}
