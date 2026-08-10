import type {FC} from "react";

interface SettingsInputProps {
    label: string;
    type?: 'text' | 'number';
    value: string | number;
    onChange: (value: string) => void;
    min?: number;
    className?: string;
}

export const SettingsInput: FC<SettingsInputProps> = ({
                                                          label,
                                                          type = 'text',
                                                          value,
                                                          onChange,
                                                          min,
                                                          className = '',
                                                      }) => {
    return (
        <div className={`form-control w-full ${className}`}>
            <label className="label py-1 px-0">
                <span className="label-text text-sm font-medium text-base-content/80">
                    {label}
                </span>
            </label>
            <input
                type={type}
                min={min}
                className="input input-bordered w-full input-sm focus:input-primary text-sm min-w-0"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};
