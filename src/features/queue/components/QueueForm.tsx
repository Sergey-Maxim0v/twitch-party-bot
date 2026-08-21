import {type FC, useCallback, useState, type MouseEvent} from "react";
import {LuUserRoundPlus} from "react-icons/lu";
import {useQueue} from "../hooks/useQueue.ts";
import {LOG_ACTOR_ROLE, LOG_INITIATOR} from "../types.ts";
import {useAuth} from "../../auth/hooks/useAuth.ts";

export interface QueueFormProps {
    className?: string;
}

const QueueForm: FC<QueueFormProps> = ({className = ""}) => {
    const {addPlayerToQueue} = useQueue();
    const {session} = useAuth();

    const [username, setUsername] = useState<string>("");
    const [messageText, setMessageText] = useState<string>("");

    const handleAddPlayer = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const trimmedUsername = username.trim();
        if (!trimmedUsername) return;

        const generatedId = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const lowerCaseUser = trimmedUsername.toLowerCase();

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
            rawMessage: messageText.trim()
        };

        addPlayerToQueue({
            playerData,
            initiator: LOG_INITIATOR.STREAMER_UI,
            actorUsername: session?.login ?? "",
            actorRole: LOG_ACTOR_ROLE.APPLICATION,
            rawCommand: "Ручное добавление в очередь",
            customTimestamp: Date.now()
        });

        setUsername("");
        setMessageText("");
    }, [username, messageText, session?.login, addPlayerToQueue]);

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div className="flex flex-col gap-2 w-full">
                <input
                    type="text"
                    placeholder="Никнейм Twitch..."
                    className="input input-bordered input-sm w-full font-medium focus:outline-none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Сообщение или игровой ник..."
                    className="input input-bordered input-sm w-full focus:outline-none"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                />
            </div>

            <button
                type="button"
                disabled={!username.trim()}
                className="btn btn-primary btn-outline btn-sm w-full font-semibold flex items-center justify-center gap-1.5"
                onClick={handleAddPlayer}
            >
                <LuUserRoundPlus className="w-4 h-4 shrink-0"/>
                <span>Добавить в очередь</span>
            </button>
        </div>
    );
};

export default QueueForm;
