import {type FC} from "react";
import {useSocketInit} from "../hooks/useSocketInit";

const SocketInitializer: FC = () => {
    useSocketInit();
    return null;
};

export default SocketInitializer;
