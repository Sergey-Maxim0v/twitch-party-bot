import React from 'react';
import {Header} from './Header';
import {AuthModal, ChannelSelectModal} from "../../features/auth";

// import {Footer} from "./Footer.tsx";

interface PageLayoutProps {
    children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({children}) => {

    return (
        <div
            className="h-screen w-screen flex flex-col bg-base-100 text-base-content antialiased transition-colors duration-200">
            <Header/>

            <main className="flex-1 w-full overflow-hidden flex flex-col">
                {children}
            </main>

            <AuthModal/>
            <ChannelSelectModal/>

            {/*<Footer/>*/}
        </div>
    );
};
