import { useCallback, useState } from 'react'
import { AUTH_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { TWITCH_AUTH_UI_MESSAGES, TWITCH_CHANNEL_ERRORS } from '../../../constants/auth.constants.ts'
import { validateChannelName } from '../utils/validateChannelName.ts'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'

/**
 * Управляет выбранным каналом чата и состоянием модального окна его выбора.
 * Видимость окна выводится из канала, восстановленного `useLocalStorage`,
 * поэтому прямых обращений к хранилищу во время рендера нет.
 *
 * @param sessionLogin - Логин авторизованного пользователя.
 * @returns Выбранный канал, состояние модального окна и обработчики выбора.
 */
export const useTwitchChannelState = (sessionLogin: string | undefined) => {
  const [activeChannel, setActiveChannel] = useLocalStorage<string | null>(AUTH_STORAGE_KEYS.ACTIVE_CHANNEL, null)
  const [isChannelModalOpen, setIsChannelModalOpen] = useState<boolean>(() => !activeChannel)
  const [channelError, setChannelError] = useState<string | null>(null)

  const openChannelModal = useCallback(() => {
    setChannelError(null)
    setIsChannelModalOpen(true)
  }, [])

  const closeChannelModal = useCallback(() => {
    setChannelError(null)
    setIsChannelModalOpen(false)
  }, [])

  const applyChannel = useCallback((channel: string | null) => {
    setChannelError(null)
    setActiveChannel(channel)
    setIsChannelModalOpen(false)
  }, [setActiveChannel])

  const selectOwnChannel = useCallback(() => {
    if (!sessionLogin) {
      setChannelError(TWITCH_AUTH_UI_MESSAGES.SESSION_NOT_FOUND)
      return
    }

    applyChannel(sessionLogin.toLowerCase())
  }, [sessionLogin, applyChannel])

  const selectCustomChannel = useCallback((channelName: string) => {
    const trimmed = channelName.trim().toLowerCase()

    if (!trimmed) {
      setChannelError(TWITCH_CHANNEL_ERRORS.EMPTY)
      return
    }

    if (!validateChannelName(trimmed)) {
      setChannelError(TWITCH_CHANNEL_ERRORS.INVALID)
      return
    }

    applyChannel(trimmed)
  }, [applyChannel])

  const resetChannel = useCallback(() => {
    applyChannel(null)
  }, [applyChannel])

  return {
    activeChannel,
    setActiveChannel,
    hasSelectedChannel: !!activeChannel,
    isChannelModalOpen,
    openChannelModal,
    closeChannelModal,
    selectOwnChannel,
    selectCustomChannel,
    resetChannel,
    channelError,
  }
}
