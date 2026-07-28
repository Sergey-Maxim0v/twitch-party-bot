import type {SocketStorage} from "../types";
import {useContext} from "react";
import {SocketInstance} from "../context/SocketInstance.ts";

export const useSocketRef = (): SocketStorage => {
    const context = useContext(SocketInstance);

    if (!context) {
        throw new Error("useSocketRef должен использоваться строго внутри SocketProvider");
    }

    return context;
};
