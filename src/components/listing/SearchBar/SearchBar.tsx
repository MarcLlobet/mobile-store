"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDebouncedValue } from "@/lib/utils/useDebouncedValue";
import { Icon } from "@/components/primitives/Icon";
import styles from "./SearchBar.module.css";

export interface SearchBarProps {
  /** Called with the trimmed query once it has settled for `debounceMs`. Never called on mount. */
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  initialValue?: string;
  /** Accessible label for the input; visually hidden but always announced. */
  label?: string;
}

/**
 * Controlled, debounced search input for the listing view's real-time,
 * API-based search (brief §1). Owns its own keystroke state so parents only
 * ever see the settled, trimmed query - never called on mount, only after
 * the person actually changes the input.
 */
export function SearchBar({
  onSearch,
  placeholder = "Search by name or brand",
  debounceMs = 300,
  initialValue = "",
  label = "Search phones by name or brand",
}: SearchBarProps) {
  const [rawValue, setRawValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(rawValue, debounceMs);
  const inputId = useId();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    onSearch(debouncedValue.trim());
  }, [debouncedValue, onSearch]);

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <Icon name="search" size={18} ariaHidden className={styles.icon} />
      <input
        id={inputId}
        type="search"
        className={styles.input}
        value={rawValue}
        onChange={(event) => setRawValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
