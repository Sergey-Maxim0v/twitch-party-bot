import React from 'react';
import {useTwitchAuth} from '../hooks/useTwitchAuth';
import {AuthContext} from "./AuthContextInstance";

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const auth = useTwitchAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};
