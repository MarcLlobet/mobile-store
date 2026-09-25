import type { Metadata } from "next";
import type { ReactNode } from "react";
// Arimo only ships 400/500/600/700 weight files (no 300/Light) — the
// browser automatically substitutes the nearest registered weight (400)
// when Figma's confirmed weight-300 text falls back to this font.
import "@fontsource/arimo/400.css";
import "@/styles/reset.css";
import "@/styles/tokens.css";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { QueryProvider } from "@/lib/query";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Mobile Store",
  description: "Browse, compare and buy mobile phones.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* QueryProvider is outermost so every route's <HydrationBoundary>
            hydrates into the same browser cache — that shared cache is what
            makes listing -> detail -> back instant. */}
        <QueryProvider>
          <CartProvider>
            <Header />
            {children}
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
