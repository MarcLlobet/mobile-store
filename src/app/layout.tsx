import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/reset.css";
import "@/styles/tokens.css";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Mobile Store",
  description: "Browse, compare and buy mobile phones.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
