import {type FC, type ReactNode} from "react";
import {useAuth} from "../hooks/useAuth.ts";

interface ProtectedViewProps {
    children: ReactNode;
    /** Компонент или разметка, отображаемая для неавторизованного пользователя */
    fallback?: ReactNode;
}

export const ProtectedView: FC<ProtectedViewProps> = ({children, fallback = null}) => {
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-base-100">
                <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
        );
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
