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

export const CART_STORAGE_KEY = "mobile-store:cart";

export interface CartContextValue {
  items: readonly CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: NewCartItem) => void;
  removeItem: (cartItemId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const ID_RANDOM_BYTES = 8;

const randomHex = (): string =>
  [...crypto.getRandomValues(new Uint8Array(ID_RANDOM_BYTES))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const createCartItemId = (): string =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${randomHex()}`;

type StoredCartItem = Omit<CartItem, "cartItemId"> & { cartItemId?: unknown };

const withUniqueIds = (items: readonly StoredCartItem[]): readonly CartItem[] =>
  items.reduce<{ seen: readonly string[]; items: readonly CartItem[] }>(
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<readonly CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems((prev) => (prev.length > 0 ? prev : readStoredCart()));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {}
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
