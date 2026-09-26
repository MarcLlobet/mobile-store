"use client";

import {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useSearchParams } from "next/navigation";

import { DEFAULT_LOCALE, LANG_SEARCH_PARAM, matchLocale, type Locale } from "./config";
import { createTranslator, type Translator } from "./translate";

export interface TranslationContextValue extends Translator {
  setLocale: (locale: Locale) => void;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

interface LocaleSearchParamSyncProps {
  locale: Locale;
  onResolve: (locale: Locale) => void;
}

const LocaleSearchParamSync = ({ locale, onResolve }: LocaleSearchParamSyncProps) => {
  const requested = matchLocale(useSearchParams().get(LANG_SEARCH_PARAM));

  useEffect(() => {
    if (requested !== null) {
      onResolve(requested);
    }
  }, [requested, onResolve]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  return null;
};

export interface TranslationProviderProps {
  initialLocale?: Locale;
  children: ReactNode;
}

export const TranslationProvider = ({
  initialLocale = DEFAULT_LOCALE,
  children,
}: TranslationProviderProps) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const value = useMemo<TranslationContextValue>(
    () => ({ ...createTranslator(locale), setLocale }),
    [locale],
  );

  return (
    <TranslationContext.Provider value={value}>
      <Suspense>
        <LocaleSearchParamSync locale={locale} onResolve={setLocale} />
      </Suspense>
      {children}
    </TranslationContext.Provider>
  );
};

const FALLBACK: TranslationContextValue = {
  ...createTranslator(DEFAULT_LOCALE),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLocale: () => {},
};

export const useTranslation = (): TranslationContextValue =>
  useContext(TranslationContext) ?? FALLBACK;
