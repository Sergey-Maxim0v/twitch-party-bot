import { useCallback, useRef, type RefObject } from 'react'
import type { TwitchIrcClient } from '../twitchIrcClient.ts'
import type { ChatAccessFacts } from '../types.ts'
import type { ChatAccessStatus } from '../../socket/types.ts'
import { createInitialChatAccessFacts } from '../utils/createInitialChatAccessFacts.ts'
import { resolveChatAccessStatus } from '../utils/resolveChatAccessStatus.ts'
import { useTwitchChannelChange } from './useTwitchChannelChange.ts'

interface UseChatAccessFactsProps {
  client: TwitchIrcClient | null;
  updateChatAccessStatus: (status: ChatAccessStatus) => void;
}

interface ChatAccessFactsStorage {
  /** Факты доступа к чату, которые обновляют обработчики IRC-событий. */
  factsRef: RefObject<ChatAccessFacts>;

  /** Сбрасывает факты при смене канала. */
  resetFacts: () => void;

  /** Пересчитывает и публикует статус доступа к чату. */
  syncStatus: () => void;
}

/**
 * Хранит факты доступа к чату и выводит из них статус.
 */
export const useChatAccessFacts = ({
  client,
  updateChatAccessStatus,
}: UseChatAccessFactsProps): ChatAccessFactsStorage => {
  const factsRef = useRef<ChatAccessFacts>(createInitialChatAccessFacts())

  const syncStatus = useCallback((): void => {
    updateChatAccessStatus(resolveChatAccessStatus(factsRef.current))
  }, [updateChatAccessStatus])

  const resetFacts = useCallback((): void => {
    factsRef.current = createInitialChatAccessFacts()
  }, [])

  useTwitchChannelChange(client, resetFacts)

  return { factsRef, resetFacts, syncStatus }
}
