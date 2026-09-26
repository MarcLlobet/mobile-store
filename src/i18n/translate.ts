import {
  CATALOGUES,
  DEFAULT_LOCALE,
  DEFAULT_MESSAGES,
  type Locale,
  type MessageKey,
} from "./config";

export type MessageParams = Readonly<Record<string, string | number>>;

type PluralBase<K> = K extends `${infer Base}_other` ? Base : never;

export type PluralKey = PluralBase<MessageKey>;

export interface Translator {
  locale: Locale;
  t: (key: MessageKey, params?: MessageParams) => string;
  plural: (key: PluralKey, count: number, params?: MessageParams) => string;
}

const PLACEHOLDER = /\{(\w+)\}/gu;

const interpolate = (template: string, params: MessageParams): string =>
  template.replaceAll(PLACEHOLDER, (_match: string, name: string) => {
    const value = params[name];
    return value === undefined ? `{${name}}` : String(value);
  });

const isMessageKey = (value: string): value is MessageKey => value in DEFAULT_MESSAGES;

export const createTranslator = (locale: Locale = DEFAULT_LOCALE): Translator => {
  const catalogue = CATALOGUES[locale];
  const pluralRules = new Intl.PluralRules(locale);

  const lookup = (key: MessageKey): string => catalogue[key] ?? DEFAULT_MESSAGES[key];

  const t = (key: MessageKey, params: MessageParams = {}): string =>
    interpolate(lookup(key), params);

  const variantKeyFor = (key: PluralKey, count: number): MessageKey | null => {
    const zeroKey = `${key}_zero`;
    const category = count === 0 && isMessageKey(zeroKey) ? "zero" : pluralRules.select(count);
    const exactKey = `${key}_${category}`;
    if (isMessageKey(exactKey)) {
      return exactKey;
    }
    const otherKey = `${key}_other`;
    return isMessageKey(otherKey) ? otherKey : null;
  };

  const plural = (key: PluralKey, count: number, params: MessageParams = {}): string => {
    const variantKey = variantKeyFor(key, count);
    return variantKey === null ? key : interpolate(lookup(variantKey), { count, ...params });
  };

  return { locale, t, plural };
};

export const getServerTranslator = (): Translator => createTranslator(DEFAULT_LOCALE);
