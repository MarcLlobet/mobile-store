# Mobile Store

A mobile-phone catalog web app — Listing, Detail and Cart views.

## Live demo

- [Store](https://marcllobet.github.io/mobile-store/)
- [Storybook](https://marcllobet.github.io/mobile-store/storybook/)

## Features

- Catalogue search with O(1) client-side prefix lookup
- Product detail with color and storage selection; cart saved in `localStorage`
- Responsive, keyboard-accessible UI with English and Spanish (`?lang=es`)
- Storybook component library and page transitions

## Stack

Next.js, React 19, TypeScript, CSS Modules, Vitest, Playwright, axe-core, and Storybook. CI and static hosting use GitHub Actions and GitHub Pages.

## Run locally

Requires Node.js 24 and pnpm 10.

```sh
pnpm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_KEY` in `.env.local` using the values from the challenge brief, then run:

```sh
pnpm dev         # App at localhost:3000
pnpm storybook   # Storybook at localhost:6006
```

## Checks

```sh
pnpm verify
pnpm exec vitest run --coverage
pnpm build:pages
pnpm exec playwright install chromium
pnpm test:e2e
```

CI also runs axe-core checks against WCAG 2.0/2.1 A and AA rules on key pages and states. Automated checks are not a WCAG certification.

## Notes

- Product data comes from an external API; cart state is local to the browser.
- GitHub Pages serves a static export under `/mobile-store`; `pnpm build:pages` builds the app and Storybook together.

## Possible next steps

Dark theme, search suggestions, and cross-device cart sync with a backend.
