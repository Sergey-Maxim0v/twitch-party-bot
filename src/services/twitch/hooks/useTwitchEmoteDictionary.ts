import { useEffect, useState } from 'react'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'
import type { TwitchEmoteDictionary } from '../types.ts'
import { loadTwitchEmoteDictionary } from '../utils/loadTwitchEmoteDictionary.ts'

const EMPTY_EMOTE_DICTIONARY: TwitchEmoteDictionary = new Map()

/**
 * Загружает словарь эмоций текущего канала и кэширует его на время сессии.
 *
 * @returns Словарь «код эмоции → ID» для сообщений без тега `emotes`.
 */
export const useTwitchEmoteDictionary = (): TwitchEmoteDictionary => {
  const { activeChannel, session } = useAuth()
  const [dictionaries, setDictionaries] = useState<ReadonlyMap<string, TwitchEmoteDictionary>>(new Map())
  const accessToken = session?.accessToken
  const dictionary = activeChannel ? dictionaries.get(activeChannel) : undefined

  useEffect(() => {
    if (!activeChannel || !accessToken) return
    if (dictionaries.has(activeChannel)) return

    let isCancelled = false

    const load = async (): Promise<void> => {
      const loadedDictionary = await loadTwitchEmoteDictionary(activeChannel, accessToken)

      if (isCancelled) return

      setDictionaries(prev => new Map(prev).set(activeChannel, loadedDictionary))
    }

    void load()

    return () => {
      isCancelled = true
    }
  }, [activeChannel, accessToken, dictionaries])

  return dictionary ?? EMPTY_EMOTE_DICTIONARY
}
