import React, {useCallback} from 'react';
import {THEME_OPTIONS} from '../../constants';
import {useTheme} from "../../hooks";
import type {ThemeMode} from "../../types";
import {LuMoon, LuCloud, LuSun, LuSunMoon} from "react-icons/lu";


const THEME_ICONS = {
    light: LuSun,
    dark: LuMoon,
    dim: LuCloud,
    system: LuSunMoon,
};

export const ThemeToggle: React.FC = () => {
    const {themeMode, setThemeMode} = useTheme();

    const toggleTheme = useCallback(() => {
        setThemeMode((prevTheme: ThemeMode) => {
            const currentIndex = THEME_OPTIONS.findIndex((option) => option.id === prevTheme);

            if (currentIndex === -1) return THEME_OPTIONS[0].id;

            const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
            return THEME_OPTIONS[nextIndex].id;
        });
    }, [setThemeMode]);

    const Icon = THEME_ICONS[themeMode as keyof typeof THEME_ICONS] || LuSunMoon;

    return (
        <div className="join border border-base-300 shadow-xs">
            <button
                key={themeMode}
                onClick={toggleTheme}
                className={`btn btn-sm join-item font-medium transition-colors`}
            >
                <Icon className="w-4 h-4"/>
            </button>
        </div>
    );
};
