import type {FC} from "react";

interface SettingsNumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    className?: string;
}

export const SettingsNumberInput: FC<SettingsNumberInputProps> = ({
                                                                      label,
                                                                      value,
                                                                      onChange,
                                                                      min = 1,
                                                                      max,
                                                                      disabled = false,
                                                                      className = '',
                                                                  }) => {
    return (
        <div className={`form-control w-full min-w-0 ${className}`}>
            <label
                className={`label cursor-pointer flex items-center justify-between gap-2 py-1 px-0 w-full min-w-0 
                ${disabled ? 'cursor-not-allowed' : ''}`}>
                <span
                    className={`label-text text-sm font-medium flex-1 min-w-0 break-normal whitespace-normal pr-2 
                    ${disabled ? 'text-base-content/40' : 'text-base-content/80'}`}>
                    {label}
                </span>

                <input
                    type="number"
                    min={min}
                    max={max}
                    disabled={disabled}
                    className="input input-bordered w-16 input-sm text-center focus:input-primary focus:outline-none text-sm shrink-0"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value) || min)}
                />
            </label>
        </div>
    );
};
