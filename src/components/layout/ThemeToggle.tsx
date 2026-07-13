import React from 'react';
import {useTheme} from '../../hooks/useTheme.ts';
import type {ThemeConfig} from "../../types/theme.types.tsx";

const THEME_OPTIONS: ThemeConfig[] = [
    {id: 'light', label: '☀️ Светлая'},
    {id: 'dark', label: '🌙 Тёмная'},
    {id: 'dim', label: '🌫️ Приглушенная'},
    {id: 'system', label: '💻 Системная'},
];

export const ThemeToggle: React.FC = () => {
    const {themeMode, setThemeMode} = useTheme();

    return (
        <div className="join border border-base-300 shadow-xs">
            {THEME_OPTIONS.map((theme) => (
                <button
                    key={theme.id}
                    onClick={() => setThemeMode(theme.id)}
                    className={`btn btn-sm join-item font-medium transition-colors ${
                        themeMode === theme.id
                            ? 'btn-primary'
                            : 'btn-ghost hover:bg-base-300'
                    }`}
                >
                    {theme.label}
                </button>
            ))}
        </div>
    );
};
