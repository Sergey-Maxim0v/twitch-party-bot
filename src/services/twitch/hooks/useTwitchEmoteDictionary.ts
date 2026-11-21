import { useEffect, useState } from 'react'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'
import type { TwitchEmoteDictionary } from '../types.ts'
import { loadTwitchEmoteDictionary } from '../utils/loadTwitchEmoteDictionary.ts'

const EMPTY_EMOTE_DICTIONARY: TwitchEmoteDictionary = new Map()

/**
 * Загружает словарь эмоций текущего канала и кэширует его на время сессии.
 * При отказе Twitch в авторизации завершает сессию.
 *
 * @returns Словарь «код эмоции → ID» для сообщений без тега `emotes`.
 */
export const useTwitchEmoteDictionary = (): TwitchEmoteDictionary => {
  const { activeChannel, session, expireSession } = useAuth()
  const [dictionaries, setDictionaries] = useState<ReadonlyMap<string, TwitchEmoteDictionary>>(new Map())
  const accessToken = session?.accessToken
  const dictionary = activeChannel ? dictionaries.get(activeChannel) : undefined

  useEffect(() => {
    if (!activeChannel || !accessToken) return
    if (dictionaries.has(activeChannel)) return

    let isCancelled = false

    const load = async (): Promise<void> => {
      const result = await loadTwitchEmoteDictionary(activeChannel, accessToken)

      if (isCancelled) return

      if (result.isUnauthorized) {
        expireSession()
        return
      }

      setDictionaries(prev => new Map(prev).set(activeChannel, result.dictionary))
    }

    void load()

    return () => {
      isCancelled = true
    }
  }, [activeChannel, accessToken, dictionaries, expireSession])

  return dictionary ?? EMPTY_EMOTE_DICTIONARY
}
