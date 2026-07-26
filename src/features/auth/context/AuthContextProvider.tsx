import React from 'react';
import {useTwitchAuth} from '../hooks/useTwitchAuth';
import {AuthContextInstance} from "./AuthContextInstance";

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthContextProvider: React.FC<AuthProviderProps> = ({children}) => {
    const auth = useTwitchAuth();

    return (
        <AuthContextInstance.Provider value={auth}>
            {children}
        </AuthContextInstance.Provider>
    );
};
