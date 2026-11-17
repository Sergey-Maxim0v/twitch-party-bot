/** Результат проверки значения из Web Storage. */
export interface SanitizedValue<T> {
  /** Проверенное значение. */
  value: T;
  /** Признак того, что исходное значение не прошло проверку. */
  isInvalid: boolean;
}

/** Параметры проверки значения в `useLocalStorage`. */
export interface LocalStorageOptions<T> {
  /** Проверяет и нормализует значение после чтения и перед записью. */
  sanitize?: (value: unknown) => SanitizedValue<T>;
}
