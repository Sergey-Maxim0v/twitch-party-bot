import {useQueue} from "./useQueue.ts";
import {useTwitchChat} from "../../../services/twitch/hooks/useTwitchChat.ts";

export const useQueueChatDispatcher = () => {
    const {} = useTwitchChat()
    const {} = useQueue();

    // TODO: логика очереди
}
