import React from 'react';
import {Header} from './Header';
import {Footer} from './Footer';
import {AuthModal} from "../../features/auth";

interface PageLayoutProps {
    children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({children}) => {

    return (
        <div
            className="h-screen w-screen flex flex-col bg-base-100 text-base-content antialiased transition-colors duration-200">
            <Header/>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
                {children}
            </main>

            <AuthModal/>

            <Footer/>
        </div>
    );
};
