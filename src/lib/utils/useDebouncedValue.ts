import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 300;

export const useDebouncedValue = <T>(value: T, delayMs = DEFAULT_DELAY_MS): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
};
