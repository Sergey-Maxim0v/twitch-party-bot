import {useState, useEffect, useCallback, useRef} from 'react';

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

    // Сохраняем актуальный initialValue в ref, чтобы не переподписывать эффект на каждый рендер объектов
    const initialValueRef = useRef(initialValue);
    useEffect(() => {
        initialValueRef.current = initialValue;
    }, [initialValue]);

    // Синхронизация состояния между вкладками браузера в реальном времени
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key) {
                try {
                    const newValue = event.newValue ? JSON.parse(event.newValue) : initialValueRef.current;
                    setStoredValue(newValue);
                } catch (error) {
                    console.error(`Ошибка парсинга синхронизированных данных по ключу "${key}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    return [storedValue, setValue];
}
