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

/**
 * Frozen contract (see plan §4 "Frozen contracts for Phase 1") — Phase 1/2
 * import `useCart()` and these types verbatim; do not rename/reshape.
 */
export const CART_STORAGE_KEY = "mobile-ecommerce:cart";

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: NewCartItem) => void;
  removeItem: (cartItemId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    // Corrupt/missing JSON, or localStorage unavailable — fall back to an
    // empty cart rather than throwing.
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Both the build-time SSG render and the first client render start from an
  // empty cart, so there is nothing for hydration to mismatch on. The real
  // persisted cart is only applied after mount, inside an effect below —
  // this is deliberate (see plan's hydration-mismatch risk callout).
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage is synchronizing with an external system that is
    // only available in the browser (unavailable during the build-time SSG
    // render) — this is the documented, intentional escape hatch for the
    // "you might not need an effect" heuristic that this lint rule encodes.
    // The functional form guards against the (unlikely, but possible in a
    // deeply nested tree) case where a descendant's own mount effect calls
    // addItem before this effect runs — passive effects fire child-before-
    // parent, so without this guard a hydration read could clobber an
    // add that raced ahead of it. Real "Add to cart" clicks can never hit
    // this: they only ever happen after mount effects have all settled.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above; required for the frozen "read localStorage lazily post-mount" contract (plan §4)
    setItems((prev) => (prev.length > 0 ? prev : readStoredCart()));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage can throw (private browsing, quota, disabled) — the
      // cart still works in-memory for the current session.
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: NewCartItem) => {
    const cartItemId = `${item.productId}-${item.color}-${item.storage}`;
    setItems((prev) => [...prev, { ...item, cartItemId }]);
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
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
