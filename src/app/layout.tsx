import "@/styles/reset.css";
import "@/styles/tokens.css";
import "./globals.css";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { ViewTransitionAbortGuard } from "@/components/shared/ViewTransitionAbortGuard";
import { CartProvider } from "@/context/CartContext";
import { TranslationProvider, getServerTranslator } from "@/i18n";

import type { Metadata } from "next";

const { t, locale } = getServerTranslator();

export const metadata: Metadata = {
  title: t("meta.title"),
  description: t("meta.description"),
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang={locale}>
    <body>
      <TranslationProvider>
        <CartProvider>
          <ViewTransitionAbortGuard />
          <Header />
          {children}
        </CartProvider>
      </TranslationProvider>
    </body>
  </html>
);

export default RootLayout;
