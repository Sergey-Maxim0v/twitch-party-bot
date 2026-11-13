import { useState, type FC, type ChangeEvent, type SyntheticEvent, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { validateChannelName } from '../utils/validateChannelName.ts'
import { LuX } from 'react-icons/lu'
import { getChannelSelectCurrentError } from '../utils/getChannelSelectCurrentError.ts'
import { getTwitchChannelProfile } from '../utils/getTwitchChannelProfile.ts'
import { isChannelConnectRequired } from '../utils/isChannelConnectRequired.ts'
import { ChannelInfoCard } from '../../channel-info/components/ChannelInfoCard.tsx'

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
  } = useAuth()

  const { connect, getClient } = useSocketContext()

  const [inputValue, setInputValue] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isNotFound, setIsNotFound] = useState(false)
  const [isValidationTriggered, setIsValidationTriggered] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && hasSelectedChannel) {
        closeChannelModal()
      }
    }

    if (isChannelModalOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isChannelModalOpen, hasSelectedChannel, closeChannelModal])

  const currentError = getChannelSelectCurrentError({
    channelError,
    isValidationTriggered,
    value: inputValue,
    isNotFound,
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsNotFound(false)
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
   * Проверяет канал на Twitch и, если он существует, выбирает его и подключает бота.
   *
   * @param channel - Имя канала.
   * @param accessToken - Токен доступа авторизованного пользователя.
   * @param select - Обработчик сохранения выбранного канала.
   */
  const verifyAndConnect = async (
    channel: string,
    accessToken: string,
    select: (value: string) => void,
  ): Promise<void> => {
    const channelProfile = await getTwitchChannelProfile(channel, accessToken)

    if (!channelProfile) {
      setIsNotFound(true)
      return
    }

    select(channel)
    connectToChannel(channel)
  }

  /**
   * Подключает бота к собственному каналу пользователя.
   */
  const handleOwnChannelClick = async () => {
    if (!session?.login || !session?.accessToken || isChecking) return

    setIsChecking(true)
    setIsNotFound(false)

    await verifyAndConnect(session.login, session.accessToken, selectOwnChannel)
    setIsChecking(false)
  }

  /**
   * Подключает бота к каналу, введённому вручную.
   *
   * @param e - Событие отправки формы.
   */
  const handleCustomSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (isChecking) return

    setIsValidationTriggered(true)
    setIsNotFound(false)

    const trimmed = inputValue.trim()

    if (!trimmed || !validateChannelName(trimmed) || !session?.login || !session?.accessToken) return

    setIsChecking(true)

    await verifyAndConnect(trimmed, session.accessToken, selectCustomChannel)
    setIsChecking(false)
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
          <h3 className="font-bold text-xl text-base-content">Выбор канала чата</h3>
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
