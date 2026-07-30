import {TwitchIrcCapability} from "../config.ts";

export interface sendInitialIrcCommandsProps {
    socket: WebSocket,
    token: string,
    userLogin: string,
    channel: string
}

/**
 * Отправляет стартовый пакет команд для авторизации и подключения к каналу Twitch IRC.
 */
export const sendInitialIrcCommands = (
    {
        socket,
        token,
        userLogin,
        channel
    }: sendInitialIrcCommandsProps
): void => {
    const lowerLogin = userLogin.toLowerCase();
    const lowerChannel = channel.toLowerCase();

    const capabilities = [
        TwitchIrcCapability.MEMBERSHIP,
        TwitchIrcCapability.TAGS,
        TwitchIrcCapability.COMMANDS
    ].join(' ')

    socket.send(`PASS oauth:${token}`);
    socket.send(`NICK ${lowerLogin}`);
    socket.send(`CAP REQ :${capabilities}`);
    socket.send(`JOIN #${lowerChannel}`);
}
