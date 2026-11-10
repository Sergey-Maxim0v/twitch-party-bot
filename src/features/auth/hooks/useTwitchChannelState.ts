import { useCallback, useState } from 'react'
import { TWITCH_STORAGE_KEYS } from '../../../constants/auth.constants.ts'
import { validateChannelName } from '../utils/validateChannelName.ts'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'

/**
 * Управляет выбранным каналом чата и состоянием модального окна его выбора.
 *
 * @param sessionLogin - Логин авторизованного пользователя.
 * @returns Выбранный канал, состояние модального окна и обработчики выбора.
 */
export const useTwitchChannelState = (sessionLogin: string | undefined) => {
  const [activeChannel, setActiveChannel] = useLocalStorage<string | null>(TWITCH_STORAGE_KEYS.ACTIVE_CHANNEL, null)
  const [isChannelModalOpen, setIsChannelModalOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem(TWITCH_STORAGE_KEYS.ACTIVE_CHANNEL)
    return !stored || stored === 'null'
  })
  const [channelError, setChannelError] = useState<string | null>(null)

  const openChannelModal = useCallback(() => {
    setChannelError(null)
    setIsChannelModalOpen(true)
  }, [])

  const closeChannelModal = useCallback(() => {
    setChannelError(null)
    setIsChannelModalOpen(false)
  }, [])

  const selectOwnChannel = useCallback(() => {
    if (!sessionLogin) {
      setChannelError('Сессия не найдена.')
      return
    }
    setChannelError(null)
    setActiveChannel(sessionLogin.toLowerCase())
    setIsChannelModalOpen(false)
  }, [sessionLogin, setActiveChannel])

  const selectCustomChannel = useCallback((channelName: string) => {
    const trimmed = channelName.trim().toLowerCase()

    if (!trimmed) {
      setChannelError('Имя канала не может быть пустым.')
      return
    }

    if (!validateChannelName(trimmed)) {
      setChannelError('Некорректное имя канала Twitch.')
      return
    }

    setChannelError(null)
    setActiveChannel(trimmed)
    setIsChannelModalOpen(false)
  }, [setActiveChannel])

  const resetChannel = useCallback(() => {
    setActiveChannel(null)
    setChannelError(null)
    setIsChannelModalOpen(false)
  }, [setActiveChannel])

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
