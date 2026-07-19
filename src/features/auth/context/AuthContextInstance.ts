import {createContext} from "react";
import type {TwitchAuthHookResult} from "../types";

export const AuthContext = createContext<TwitchAuthHookResult | undefined>(undefined);
