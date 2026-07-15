import React from 'react';
import {ThemeToggle} from './ThemeToggle';
import {LuTwitch} from "react-icons/lu";

export const Header: React.FC = () => {
    return (
        <header className="navbar bg-base-200 border-b border-base-300 px-6 flex justify-between items-center">
            <LuTwitch className="mr-2 text-2xl font-black text-primary select-none"/>

            <div className="flex-1">
                <span className="text-xl font-black tracking-tight text-primary select-none">
                  Twitch Party Bot
                </span>
            </div>

            <div className="flex-none">
                <ThemeToggle/>
            </div>
        </header>
    );
};
