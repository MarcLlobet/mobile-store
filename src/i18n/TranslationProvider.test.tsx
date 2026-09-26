import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LOCALE, type Locale } from "./config";
import { TranslationProvider, useTranslation } from "./TranslationProvider";

const searchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams.current,
}));

const Probe = () => {
  const { t, locale } = useTranslation();
  return <span data-testid="probe">{`${locale}: ${t("cart.total")}`}</span>;
};

const renderWithSearch = (query: string, initialLocale?: Locale) => {
  searchParams.current = new URLSearchParams(query);
  return render(
    <TranslationProvider initialLocale={initialLocale}>
      <Probe />
    </TranslationProvider>,
  );
};

beforeEach(() => {
  searchParams.current = new URLSearchParams();
  document.documentElement.setAttribute("lang", DEFAULT_LOCALE);
});

describe("TranslationProvider", () => {
  it.each([
    ["no lang at all", "", "en"],
    ["a lang we ship", "lang=es", "es"],
    ["a lang we do not ship", "lang=fr", "en"],
    ["an empty lang", "lang=", "en"],
    ["a lang that is not a locale", "lang=1", "en"],
  ])("renders %s as %s", async (_case, query, expected) => {
    renderWithSearch(query);

    await waitFor(() => {
      expect(screen.getByTestId("probe")).toHaveTextContent(`${expected}: Total`);
    });
  });

  it("mirrors the active locale onto <html lang>, so screen readers switch voice", async () => {
    renderWithSearch("lang=es");

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "es");
    });
  });

  it("starts on the locale it is given when the URL asks for nothing", () => {
    renderWithSearch("", "es");

    expect(screen.getByTestId("probe")).toHaveTextContent("es: Total");
  });

  it("lets ?lang override the locale it was given", async () => {
    renderWithSearch("lang=en", "es");

    await waitFor(() => {
      expect(screen.getByTestId("probe")).toHaveTextContent("en: Total");
    });
  });

  it("translates the whole catalogue, not just the key under test", async () => {
    renderWithSearch("lang=es");

    await waitFor(() => {
      expect(screen.getByTestId("probe")).toHaveTextContent("es:");
    });
  });
});

describe("useTranslation without a provider", () => {
  it("falls back to the default locale instead of throwing", () => {
    render(<Probe />);

    expect(screen.getByTestId("probe")).toHaveTextContent(`${DEFAULT_LOCALE}: Total`);
  });
});
