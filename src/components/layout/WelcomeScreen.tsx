import React from 'react';
import {LuTwitch} from 'react-icons/lu';
import {useAuth} from '../../features/auth';

export const WelcomeScreen: React.FC = () => {
    const {login} = useAuth();

    return (
        <div className="flex h-full items-center justify-center p-6 bg-base-100">
            <div className="max-w-md text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <LuTwitch className="text-4xl animate-pulse"/>
                </div>

                <h2 className="text-3xl font-black tracking-tight text-base-content">
                    Twitch Party Queue
                </h2>

                <p className="text-sm text-base-content/60 leading-relaxed max-w-sm">
                    Собирайте зрителей в пати для совместных игр прямо во время стрима. Управляйте очередью, модерируйте
                    заявки и играйте вместе без лишней рутины.
                </p>

                <button
                    onClick={login}
                    className="btn btn-primary mt-2 flex items-center gap-2"
                >
                    <LuTwitch className="text-lg"/>
                    Авторизоваться через Twitch
                </button>
            </div>
        </div>
    );
};