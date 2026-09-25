import "@fontsource/arimo/400.css";
import "@/styles/reset.css";
import "@/styles/tokens.css";
import "./globals.css";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { CartProvider } from "@/context/CartContext";
import { QueryProvider } from "@/lib/query";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile Store",
  description: "Browse, compare and buy mobile phones.",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body>
      <QueryProvider>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </QueryProvider>
    </body>
  </html>
);

export default RootLayout;
