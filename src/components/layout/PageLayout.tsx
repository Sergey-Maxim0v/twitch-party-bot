import React, {type FC} from 'react';
import Header from "./Header.tsx";
import {AuthModal, ChannelSelectModal} from "../../features/auth";

interface PageLayoutProps {
    children: React.ReactNode;
}

const PageLayout: FC<PageLayoutProps> = ({children}) => {

    return (
        <div
            className="h-screen w-screen flex flex-col bg-base-100 text-base-content antialiased transition-colors duration-200">
            <Header/>

            <main className="flex-1 w-full overflow-hidden flex flex-col">
                {children}
            </main>

            <AuthModal/>
            <ChannelSelectModal/>
        </div>
    );
};

export default PageLayout;

