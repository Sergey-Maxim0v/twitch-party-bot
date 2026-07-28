import {createContext} from "react";
import type {SocketStorage} from "../types";

export const SocketInstance = createContext<SocketStorage | null>(null);
