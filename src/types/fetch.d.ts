/* eslint-disable @typescript-eslint/method-signature-style, functional/prefer-property-signatures -- lib.dom declares Body.json as a method, and only a method signature merges with it into an overload */
interface Body {
  json<T = unknown>(): Promise<T>;
}
