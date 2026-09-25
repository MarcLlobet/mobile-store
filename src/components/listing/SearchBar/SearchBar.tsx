"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Icon } from "@/components/primitives/Icon";
import { useDebouncedValue } from "@/lib/utils/useDebouncedValue";

import styles from "./SearchBar.module.css";

export interface SearchBarProps {
  readonly onSearch: (query: string) => void;
  readonly placeholder?: string;
  readonly debounceMs?: number;
  readonly initialValue?: string;
  readonly label?: string;
  readonly clearLabel?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder = "Search for a smartphone",
  debounceMs = 300,
  initialValue = "",
  label = "Search phones for a smartphone",
  clearLabel = "Clear search",
}: SearchBarProps) => {
  const [rawValue, setRawValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(rawValue, debounceMs);
  const inputId = useId();
  const isFirstRun = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setRawValue("");
    inputRef.current?.focus();
  };

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
      <input
        id={inputId}
        ref={inputRef}
        type="search"
        className={styles.input}
        value={rawValue}
        onChange={(event) => setRawValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {rawValue === "" ? null : (
        <button
          type="button"
          className={styles.clear}
          aria-label={clearLabel}
          onClick={handleClear}
        >
          <Icon name="close" size={7} ariaHidden />
        </button>
      )}
    </div>
  );
};
