import {createContext} from "react";
import type {TwitchAuthHookResult} from "../types";

export const AuthContextInstance = createContext<TwitchAuthHookResult | undefined>(undefined);
