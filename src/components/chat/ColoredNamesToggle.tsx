import type {FC} from "react";

interface ColoredNamesToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const ColoredNamesToggle: FC<ColoredNamesToggleProps> = ({checked, onChange}) => {
    return (
        <label
            className="label cursor-pointer gap-2 bg-base-300/50 px-2 py-1 rounded-lg border border-base-content/5 animate-fadeIn">
            <span className="label-text text-xs font-medium">Цветные ники</span>
            <input
                type="checkbox"
                className="checkbox checkbox-xs checkbox-primary"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </label>
    );
};
