import { useEffect, useState } from "react";

/**
 * Generic debounce hook: returns `value`, but only after it has stopped
 * changing for `delayMs`. Used by the listing view's real-time API search
 * (see plan §4, workstream A) so keystrokes don't each trigger their own
 * network request against the external API.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
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
}
