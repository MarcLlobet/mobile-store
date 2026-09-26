import { describe, expect, it } from "vitest";

import { CATALOGUES, DEFAULT_LOCALE, LOCALE_LABELS, SUPPORTED_LOCALES } from "./config";
import en from "./messages/en.json";

const PLACEHOLDER = /\{(\w+)\}/gu;

const placeholdersIn = (message: string): readonly string[] =>
  [...message.matchAll(PLACEHOLDER)]
    .map(([, name]) => name ?? "")
    .toSorted((a, b) => a.localeCompare(b));

const TRANSLATED_LOCALES = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

describe.each(TRANSLATED_LOCALES)("the %s catalogue", (locale) => {
  const catalogue = CATALOGUES[locale];

  it("translates every key the default catalogue declares", () => {
    const missing = Object.keys(en).filter((key) => !(key in catalogue));

    expect(missing).toEqual([]);
  });

  it("declares no key the default catalogue does not — a typo would silently never render", () => {
    const unknown = Object.keys(catalogue).filter((key) => !(key in en));

    expect(unknown).toEqual([]);
  });

  it("keeps the same placeholders, so no interpolated value is dropped or renamed", () => {
    const mismatched = Object.entries(en)
      .filter(([key, source]) => {
        const translated = catalogue[key as keyof typeof en] ?? "";
        return placeholdersIn(source).join(",") !== placeholdersIn(translated).join(",");
      })
      .map(([key]) => key);

    expect(mismatched).toEqual([]);
  });

  it("actually translates — it is not a copy of the default catalogue", () => {
    const identical = Object.entries(en).filter(
      ([key, source]) => catalogue[key as keyof typeof en] === source,
    );

    expect(identical.length).toBeLessThan(Object.keys(en).length / 2);
  });

  it("has a label to list itself under", () => {
    expect(LOCALE_LABELS[locale]).not.toBe("");
  });
});
