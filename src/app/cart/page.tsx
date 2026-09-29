"use client";

import { CartView } from "@/components/cart/CartView";
import { useCart } from "@/context/CartContext";

const CartPage = () => {
  const { items, removeItem, totalPrice } = useCart();

  return <CartView items={items} totalPrice={totalPrice} onRemove={removeItem} />;
};

export default CartPage;
