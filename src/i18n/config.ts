import en from "./messages/en.json";
import es from "./messages/es.json";

export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = ["en", "es"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type MessageKey = keyof typeof en;

export type Messages = Readonly<Record<MessageKey, string>>;

export const DEFAULT_MESSAGES: Messages = en;

export const LANG_SEARCH_PARAM = "lang";

export const LOCALE_LABELS: Readonly<Record<Locale, string>> = {
  en: "English",
  es: "Español",
};

const spanish: Messages = es;

export const CATALOGUES: Readonly<Record<Locale, Partial<Messages>>> = {
  en,
  es: spanish,
};

const SUPPORTED_LOCALE_NAMES: readonly string[] = SUPPORTED_LOCALES;

const isSupportedLocale = (value: string): value is Locale =>
  SUPPORTED_LOCALE_NAMES.includes(value);

export const matchLocale = (value: string | null | undefined): Locale | null =>
  value != null && isSupportedLocale(value) ? value : null;
