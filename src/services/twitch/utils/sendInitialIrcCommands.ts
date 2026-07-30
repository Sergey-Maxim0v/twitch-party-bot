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

    socket.send(`PASS oauth:${token}`);
    socket.send(`NICK ${lowerLogin}`);
    socket.send("CAP REQ :twitch.tv/commands twitch.tv/tags");
    socket.send(`JOIN #${lowerChannel}`);
}
