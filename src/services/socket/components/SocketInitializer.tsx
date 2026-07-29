import {type FC} from "react";
import {useSocketInit} from "../hooks/useSocketInit";

export const SocketInitializer: FC = () => {
    useSocketInit();
    return null;
};
