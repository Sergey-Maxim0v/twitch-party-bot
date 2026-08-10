import type {FC} from "react";

interface SettingsCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

export const SettingsCheckbox: FC<SettingsCheckboxProps> = ({
                                                                label,
                                                                checked,
                                                                onChange,
                                                                className = '',
                                                            }) => {
    return (
        <div className={`form-control ${className}`}>
            <label className="label cursor-pointer flex justify-between gap-2 py-1 px-0 w-full min-w-0">
                <span className="label-text text-sm font-medium text-base-content/80 wrap-break-word max-w-[80%]">
                    {label}
                </span>
                <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm shrink-0"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </label>
        </div>
    );
};
