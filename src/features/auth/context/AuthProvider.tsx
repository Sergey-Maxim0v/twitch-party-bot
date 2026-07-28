import {type FC, type ReactNode} from 'react';
import {useTwitchAuth} from '../hooks/useTwitchAuth';
import {AuthContext} from "./AuthContextInstance";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({children}) => {
    const auth = useTwitchAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};
