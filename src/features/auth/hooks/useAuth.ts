import {useContext} from "react";
import type {TwitchAuthHookResult} from "../types";
import {AuthContext} from "../context/AuthContextInstance.ts";

export const useAuth = (): TwitchAuthHookResult => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
