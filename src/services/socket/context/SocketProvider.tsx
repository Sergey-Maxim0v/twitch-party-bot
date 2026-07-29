import {type FC, type ReactNode, useMemo, useRef} from "react";
import {TwitchIrcClient} from "../../twitch";
import {SocketInstance} from "./SocketInstance";

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: FC<SocketProviderProps> = ({children}) => {
    const clientRef = useRef<TwitchIrcClient>(new TwitchIrcClient());

    const connect = (channel: string, token: string, userLogin: string) => {
        clientRef.current.connect(channel, token, userLogin);
    };

    const disconnect = () => {
        clientRef.current.disconnect();
    };

    const value = useMemo(() => ({
        get: () => null,
        set: () => {
        },
        connect,
        disconnect
    }), []);

    return (
        <SocketInstance.Provider value={value}>
            {children}
        </SocketInstance.Provider>
    );
};
