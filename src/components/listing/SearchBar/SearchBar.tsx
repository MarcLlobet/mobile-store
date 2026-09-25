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
  /** Accessible label for the clear control, which shows only an icon. */
  clearLabel?: string;
}

/**
 * Controlled, debounced search input for the listing view's real-time,
 * API-based search (brief §1). The clear control is our own button carrying
 * the Figma cross, because `type="search"`'s native cancel button is drawn by
 * the browser and cannot be restyled; the native one is hidden in CSS.
 *
 * Owns its own keystroke state so parents only
 * ever see the settled, trimmed query - never called on mount, only after
 * the person actually changes the input.
 */
export function SearchBar({
  onSearch,
  placeholder = "Search for a smartphone",
  debounceMs = 300,
  initialValue = "",
  label = "Search phones for a smartphone",
  clearLabel = "Clear search",
}: SearchBarProps) {
  const [rawValue, setRawValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(rawValue, debounceMs);
  const inputId = useId();
  const isFirstRun = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClear() {
    setRawValue("");
    // Clearing shouldn't cost the user their place: keep the caret in the
    // field so they can type the next query straight away.
    inputRef.current?.focus();
  }

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
      {/* Replaces the browser's own search-cancel affordance (hidden in CSS),
          which is a UA-drawn glyph that can't be styled to match the design. */}
      {rawValue !== "" && (
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
}
