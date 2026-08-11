import {createContext} from "react";
import type {SocketStorage} from "../types.ts";

export const SocketInstance = createContext<SocketStorage | null>(null);
