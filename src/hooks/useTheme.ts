import {useEffect} from 'react';
import {THEME_OPTIONS} from "../constants";
import {useLocalStorage} from "./useLocalStorage.ts";
import type {ThemeConfig, ThemeMode} from "../types";

export const useTheme = () => {
    const DEFAULT_THEME: ThemeConfig = THEME_OPTIONS.find((el) => el.id === 'system') || THEME_OPTIONS[0]
    const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('twitch_party_theme', DEFAULT_THEME.id);

    useEffect(() => {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            if (themeMode === 'system') {
                const isDark = mediaQuery.matches;
                root.setAttribute('data-theme', isDark ? 'dark' : 'light');
            } else {
                root.setAttribute('data-theme', themeMode);
            }
        };

        applyTheme();

        if (themeMode === 'system') {
            mediaQuery.addEventListener('change', applyTheme);

            return () => {
                mediaQuery.removeEventListener('change', applyTheme);
            };
        }

    }, [themeMode]);

    return {themeMode, setThemeMode};
};
