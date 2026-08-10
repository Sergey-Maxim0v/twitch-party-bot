import type {FC} from "react";

interface SettingsNumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    className?: string;
}

export const SettingsNumberInput: FC<SettingsNumberInputProps> = ({
                                                                      label,
                                                                      value,
                                                                      onChange,
                                                                      min = 1,
                                                                      max,
                                                                      className = '',
                                                                  }) => {
    return (
        <div className={`form-control ${className}`}>
            <label className="label cursor-pointer flex justify-between gap-4 py-1 px-0 w-full min-w-0">
        <span className="label-text text-sm font-medium text-base-content/80 wrap-break-word max-w-[70%]">
          {label}
        </span>
                <input
                    type="number"
                    min={min}
                    max={max}
                    className="input input-bordered w-16 input-sm text-center focus:input-primary text-sm shrink-0"
                    value={value}
                    onChange={
                        (e) => onChange(Number(e.target.value) || min)
                    }
                />
            </label>
        </div>
    );
};
