import type {FC} from "react";

interface SettingsCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
}

export const SettingsCheckbox: FC<SettingsCheckboxProps> = ({
                                                                label,
                                                                checked,
                                                                onChange,
                                                                className = '',
                                                                disabled
                                                            }) => {
    return (
        <div className={`form-control w-full min-w-0 ${className} `}>
            <label
                className={`label cursor-pointer flex items-start justify-between gap-2 py-1 px-0 w-full min-w-0 
                ${disabled ? 'cursor-not-allowed' : ''}`}>
                <span
                    className={`label-text text-sm font-medium flex-1 min-w-0 break-normal whitespace-normal pr-2 
                ${disabled ? 'text-base-content/40' : 'text-base-content/80'}`}>
                    {label}
                </span>

                <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm shrink-0 mt-0.5 focus:input-primary focus:outline-none"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </label>
        </div>
    );
};
