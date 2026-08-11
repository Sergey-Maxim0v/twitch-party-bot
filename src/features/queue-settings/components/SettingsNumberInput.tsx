import {type ChangeEvent, type FC, useState} from "react";

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
                                                                      min = 0,
                                                                      max = 999999,
                                                                      disabled = false,
                                                                      className = '',
                                                                  }) => {
    const [inputValue, setInputValue] = useState<string>(String(value));
    const [prevValue, setPrevValue] = useState<number>(value);

    if (value !== prevValue) {
        setPrevValue(value);
        setInputValue(String(value));
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const stringValue = e.target.value;
        setInputValue(stringValue);

        if (stringValue === "") {
            onChange(min);
            return;
        }

        const parsedValue = parseInt(stringValue, 10);

        if (!isNaN(parsedValue)) {
            const clampedValue = Math.max(min, Math.min(max, parsedValue));

            onChange(clampedValue);

            if (parsedValue !== clampedValue) {
                setInputValue(String(clampedValue));
            }
        }
    };

    const handleBlur = () => {
        if (inputValue === "") {
            setInputValue(String(min));
        }
    };

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
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </label>
        </div>
    );
};
