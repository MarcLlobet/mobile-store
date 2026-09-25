export const DEFAULT_CURRENCY = "EUR";

export const formatPrice = (value: number, currency: string = DEFAULT_CURRENCY): string =>
  `${Math.round(value)} ${currency}`;
