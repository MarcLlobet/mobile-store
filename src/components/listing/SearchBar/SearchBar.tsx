"use client";

import { useId, useRef, useState } from "react";

import { Icon } from "@/components/primitives/Icon";
import { useTranslation } from "@/i18n";

import styles from "./SearchBar.module.css";

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const SearchBar = ({ onSearch, placeholder, initialValue = "" }: SearchBarProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (next: string) => {
    setValue(next);
    onSearch(next);
  };

  const handleClear = () => {
    update("");
    inputRef.current?.focus();
  };

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        {t("search.label")}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="search"
        className={styles.input}
        value={value}
        onChange={(event) => {
          update(event.target.value);
        }}
        placeholder={placeholder ?? t("search.placeholder")}
        autoComplete="off"
      />
      {value === "" ? null : (
        <button
          type="button"
          className={styles.clear}
          aria-label={t("search.clear_label")}
          onClick={handleClear}
        >
          <Icon name="close" size={14} ariaHidden />
        </button>
      )}
    </div>
  );
};
