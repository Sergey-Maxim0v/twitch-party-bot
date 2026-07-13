import {useState, useCallback} from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Ошибка чтения localStorage по ключу "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            setStoredValue((valueToStore) => {
                const newValue = value instanceof Function ? value(valueToStore) : value;
                window.localStorage.setItem(key, JSON.stringify(newValue));
                return newValue;
            });
        } catch (error) {
            console.error(`Ошибка записи в localStorage по ключу "${key}":`, error);
        }
    }, [key]);

    return [storedValue, setValue];
}