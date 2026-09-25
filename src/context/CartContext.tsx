"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartItem, NewCartItem } from "@/types/cart";

export const CART_STORAGE_KEY = "mobile-ecommerce:cart";

export interface CartContextValue {
  readonly items: readonly CartItem[];
  readonly itemCount: number;
  readonly totalPrice: number;
  readonly addItem: (item: NewCartItem) => void;
  readonly removeItem: (cartItemId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const ID_RANDOM_BYTES = 8;

/** Hex-encodes bytes so the fallback id is as collision-resistant as a UUID. */
const randomHex = (): string =>
  [...crypto.getRandomValues(new Uint8Array(ID_RANDOM_BYTES))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const createCartItemId = (): string =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${randomHex()}`;

/** A line as it comes back out of storage: anything may have been written there. */
type StoredCartItem = Omit<CartItem, "cartItemId"> & { readonly cartItemId?: unknown };

/**
 * Older builds wrote lines without ids, and duplicates crept in, so every id is
 * re-checked on the way in. Folds rather than mutating a shared `Set`, so the
 * ids already handed out travel with the accumulator.
 */
const withUniqueIds = (items: readonly StoredCartItem[]): readonly CartItem[] =>
  items.reduce<{ readonly seen: readonly string[]; readonly items: readonly CartItem[] }>(
    (acc, item) => {
      const id = item.cartItemId;
      const isUsable = typeof id === "string" && id !== "" && !acc.seen.includes(id);
      const cartItemId = isUsable ? id : createCartItemId();
      return {
        seen: [...acc.seen, cartItemId],
        items: [...acc.items, { ...item, cartItemId }],
      };
    },
    { seen: [], items: [] },
  ).items;

const readStoredCart = (): readonly CartItem[] => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (raw === null || raw === "") {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? withUniqueIds(parsed as readonly StoredCartItem[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { readonly children: ReactNode }) => {
  const [items, setItems] = useState<readonly CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above; required for the frozen "read localStorage lazily post-mount" contract (plan §4)
    setItems((prev) => (prev.length > 0 ? prev : readStoredCart()));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // A full or disabled storage quota must not take the cart down with it.
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: NewCartItem) => {
    setItems((prev) => [...prev, { ...item, cartItemId: createCartItemId() }]);
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const itemCount = items.length;
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, itemCount, totalPrice, addItem, removeItem }),
    [items, itemCount, totalPrice, addItem, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
};
