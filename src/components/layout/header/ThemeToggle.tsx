import {type FC, useCallback} from 'react';
import {LuMoon, LuSun, LuSunMoon, LuPalette} from "react-icons/lu";
import {useTheme} from "../../../hooks/useTheme.ts";
import type {ThemeMode} from "../../../hooks/types/theme.types.ts";
import {THEME_OPTIONS} from "../../../constants/theme.constants.ts";

const THEME_ICONS = {
    nord: LuSun,
    dim: LuMoon,
    system: LuSunMoon,
};

const ThemeToggle: FC = () => {
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
    const currentOption = THEME_OPTIONS.find((option) => option.id === themeMode);

    return (
        <div
            role="button"
            onClick={toggleTheme}
            className="flex items-center justify-between w-full h-full px-3 py-2.5 rounded-md transition-colors select-none"
        >
            <div className="flex items-center gap-2 text-sm">
                <LuPalette className="text-base-content/60 text-base shrink-0"/>
                <span className="opacity-60 font-medium">тема оформления:</span>
            </div>

            <span className="badge badge-sm font-medium opacity-70 flex items-center gap-1 text-xs">
                <Icon className="text-[10px]"/>
                <span>{currentOption?.description || 'Тема'}</span>
            </span>
        </div>
    );
};

export default ThemeToggle;
