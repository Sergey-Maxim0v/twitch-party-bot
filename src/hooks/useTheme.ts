import {useEffect} from 'react';
import type {ThemeMode} from "../types/theme.types";
import {useLocalStorage} from "./useLocalStorage.ts";

export const useTheme = () => {
    const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('twitch_party_theme', 'system');

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = () => {
            if (themeMode === 'system') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                root.setAttribute('data-theme', isDark ? 'dark' : 'light');
            } else {
                root.setAttribute('data-theme', themeMode);
            }
        };

        applyTheme();

        if (themeMode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [themeMode]);

    return {themeMode, setThemeMode};
};
