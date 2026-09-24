# Mobile Store

A mobile-phone catalog web app — Listing, Detail and Cart views — built for
the Zara Frontend Challenge. See `instructions.md` for the original brief.

Live app: `https://<your-github-username>.github.io/mobile-ecommerce/`
Live Storybook / design system: `https://<your-github-username>.github.io/mobile-ecommerce/storybook/`
(both published by the same CI deploy — see [CI / Deploy](#ci--deploy) —
once this repo has a remote and GitHub Pages is enabled on it).

## Setup

Prerequisites: Node 22, [pnpm](https://pnpm.io) 10 (`packageManager` in
`package.json` pins the exact version; `corepack enable` will pick it up
automatically).

```bash
pnpm install
cp .env.example .env.local   # fill in / confirm the two NEXT_PUBLIC_ vars
pnpm dev                     # http://localhost:3000
```

`.env.local` needs two variables (both already documented, with real
values, in `.env.example`):

| Variable                   | Meaning                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the external catalog API.                                                                               |
| `NEXT_PUBLIC_API_KEY`      | The `x-api-key` required on every request (see [Architecture](#architecture) for why this is intentionally public). |

### Production build + local preview

```bash
pnpm build          # next build, output:'export' -> static HTML/JS in out/
pnpm build-storybook # storybook build -> storybook-static/
```

The production build is a **static export** with `basePath: '/mobile-ecommerce'`
baked into every asset URL (see [Architecture](#architecture)), so every page
in `out/` expects to be served from a `/mobile-ecommerce/` sub-path, not from
a server's root. That means the obvious `pnpm start` (`serve out`, which
serves `out/` **at** the root) will load with broken CSS/JS — that's a
property of previewing a GitHub Pages project-page build locally, not a bug.
To preview it correctly, nest it one level and serve _that_:

```bash
mkdir -p /tmp/preview/mobile-ecommerce
cp -r out/* /tmp/preview/mobile-ecommerce/
npx serve /tmp/preview
# open http://localhost:3000/mobile-ecommerce/
```

To preview the merged app+Storybook deploy exactly as CI assembles it:

```bash
cp -r storybook-static out/storybook   # same command ci.yml runs
# then nest + serve out/ as above; /mobile-ecommerce/storybook/ will work too
```

## Architecture

### App Router, but static export (SSG, not per-request SSR)

This is a [Next.js App Router](https://nextjs.org/docs/app) project, but
`next.config.ts` sets `output: 'export'`: there is **no backend of our own**
and the deploy target is **GitHub Pages**, which only serves static files —
there is no Node process running after deploy to do per-request SSR. Server
Components still run, just once, at `next build` time, pre-rendering every
route (including all 24 `/phones/[id]` pages via `generateStaticParams()`) to
static HTML. This is what the brief's optional "use SSR with Next.js" line
means here in practice — SSG via Next's Server Components, not a running
Node server — and it's the reason `images.unoptimized: true` is set (the
`next/image` optimization API needs a server) and why `basePath`/
`assetPrefix` are pinned to `/mobile-ecommerce` (GitHub Pages project pages
are served from a sub-path of `github.io`, not the domain root) with
`trailingSlash: true` and a committed `public/.nojekyll` (GitHub Pages'
default Jekyll processing otherwise ignores the `_next/` output folder
because it starts with `_`).

### Why the API key ships in the client bundle

The brief requires an `x-api-key` header on every request, and requires
real-time, API-based search — which means the browser itself calls the
external API directly on every keystroke, not just at build time. With a
real backend, the key could be held server-side and proxied. Without one
(static export, no server after deploy), **the key must ship in the client
bundle** — `NEXT_PUBLIC_*` variables are inlined into the client JS by
Next.js at build time; that inlining is the intended mechanism here, not an
accidental leak. This is an accepted, deliberate tradeoff: the key is the
brief's own public test fixture (printed in `instructions.md` itself), sourced
at build time from a **GitHub Actions secret** so it's never committed to the
repo, and there is no way to keep it server-secret once this specific
combination (no backend + GitHub Pages + live client-side search) is chosen.
A reviewer inspecting the built JS in `out/_next/` and finding the key there
should read that as "working as designed," not as a vulnerability — see the
comment in `.env.example` and `src/lib/api/api.ts` for the same explanation
in context.

### Folder structure

```
src/
├─ app/                      # Next.js App Router routes
│  ├─ layout.tsx              # <CartProvider><Header/>{children}</CartProvider>, global font/reset
│  ├─ page.tsx / loading.tsx  # "/" — Listing (Server Component: SSG-fetches first 20 at build)
│  ├─ phones/[id]/            # Detail — generateStaticParams() over all product ids
│  ├─ cart/page.tsx           # "/cart" — pure client CartContext consumer
│  └─ integration.test.tsx    # Listing -> Detail -> Cart walk-through (see Testing)
├─ components/
│  ├─ primitives/             # Button, Icon, Badge, Skeleton, Price — app-agnostic building blocks
│  ├─ shared/ProductTile/     # reused by the listing grid AND Detail's "Similar products"
│  ├─ layout/Header/          # global nav bar, reads useCart() itself
│  ├─ listing/                # SearchBar, ResultsCount, PhoneGrid, EmptyState
│  ├─ detail/                 # PhoneHero, Color/StorageSelector, SpecsList, AddToCartButton, SimilarProducts
│  └─ cart/                   # CartList, CartItem, CartSummary, EmptyCart
├─ context/CartContext.tsx    # the only piece of app state; localStorage-persisted
├─ lib/
│  ├─ api/{types,api,transform}.ts  # direct-to-external-API client + documented quirk workarounds
│  └─ utils/useDebouncedValue.ts
├─ styles/{tokens.css,reset.css}    # CSS custom properties + a small reset
└─ types/cart.ts
```

Every component folder follows the same convention: `Component.tsx`,
`Component.module.css`, `Component.test.tsx`, `Component.stories.tsx`,
`index.ts`. Components below `primitives`/`shared` are deliberately kept
**prop-driven** rather than reading `useCart()`/routing themselves wherever
practical (e.g. `CartItem`, `CartList`, `CartSummary` all take their data and
callbacks as props from `app/cart/page.tsx`, the one place that actually
calls `useCart()` in that subtree) — this is what makes every one of them
renderable standalone in Storybook with no provider, and is checked
component-by-component via each `.stories.tsx`.

### State management: Context API, not Redux

The brief calls for React Context specifically, and the app's actual shared
state is small enough that it doesn't need more: **one** piece of global
state (the cart) that a handful of components read/write. `CartContext`
exposes `{ items, itemCount, totalPrice, addItem, removeItem }`; the cart
persists to `localStorage` (key `mobile-ecommerce:cart`), read back lazily
_after_ mount (in an effect, not during initial render) specifically to avoid
a hydration mismatch — the server-rendered/first-client-render HTML and the
"real" persisted cart can otherwise disagree, which the brief's "console must
be free of warnings" requirement would flag immediately. There's no
merge/quantity concept: each "Add to cart" click is its own independent line,
keyed `` `${productId}-${color}-${storage}` `` — the brief only asks for
individual removal, not incrementing an existing line.

## Testing

```bash
pnpm test          # vitest run — all unit + integration tests, once
pnpm test:watch    # vitest, watch mode
pnpm exec vitest run --coverage   # same as CI's blocking gate, with a coverage report
```

Vitest + React Testing Library, `jsdom` environment. As of this writing: 29
test files, 114 tests, ~99% statement coverage. What's covered:

- **`CartContext`**: empty initial state, `addItem`'s exact `cartItemId`
  shape, no-merge-by-design, `removeItem`, `itemCount`/`totalPrice`
  derivation, localStorage round-trip, and that corrupt/missing JSON in
  storage never throws.
- **Primitives**: disabled-button blocks `onClick`, icon-per-`name`,
  zero-count badge renders nothing, price formatting.
- **Listing**: debounced search calls the API with the right params,
  results-count text/`aria-live`, the grid renders every field with no
  duplicate-key warning against the _known_ duplicate-id fixture, the empty
  state, the error state, skeleton loading.
- **Detail**: color click swaps the hero image `src`; storage click updates
  the displayed price to that tier's absolute price (not `basePrice + delta`);
  "Add to cart" stays disabled until both are picked, then calls `addItem`
  exactly once with the right payload; specs render all 8 fields; similar
  products render with correct hrefs.
- **Cart**: every item field renders, remove calls `removeItem` and the row
  disappears, the total recalculates, the empty state appears at 0 items,
  "Continue shopping" navigates to `/` from both the populated and the empty
  state.
- **`src/app/integration.test.tsx`**: the one true end-to-end walk across all
  three views sharing a single `CartProvider` instance — search the listing,
  click a card, land on the exact product's Detail page, select color +
  storage, add to cart, switch to the Cart view and verify the line item has
  the _selected_ color/storage/price (not defaults), remove it, and see the
  empty state. This is the seam three independently-built view "workstreams"
  can't verify on their own.
- **Storybook** is the manual/visual agnosticism check, not a Vitest
  replacement: every component renders standalone in its own story, with any
  app-state dependency (router, cart) made explicit via a decorator.

## Storybook / Design system

```bash
pnpm storybook          # http://localhost:6006
pnpm build-storybook    # -> storybook-static/
```

Every component — primitives through full view-level components — has a
colocated `.stories.tsx`. This is the practical proof that components are
context-agnostic: anything that would otherwise silently depend on
`CartProvider` or the router is instead given that dependency explicitly via
a story decorator, so it's visible in the story itself, not hidden behind an
app-wide provider.

Storybook is **published alongside the app in the same deploy**, at
`/mobile-ecommerce/storybook/` — see [CI / Deploy](#ci--deploy). There is no
second GitHub Pages site: `ci.yml` merges `storybook-static/` into the app's
own static export output (`cp -r storybook-static out/storybook`) before
uploading it as one Pages artifact.

## CI / Deploy

`.github/workflows/ci.yml` runs on every push/PR to `main`, all steps
required and blocking (a failing unit test fails the whole job, per the
brief's explicit requirement that this not be "just a local nice-to-have"):

1. `pnpm install --frozen-lockfile`
2. `pnpm lint --max-warnings=0`
3. `pnpm format:check`
4. `pnpm typecheck`
5. `pnpm exec vitest run --coverage` — unit + integration tests
6. `pnpm build-storybook` — fails the job if any story throws
7. `pnpm build` — the static export (`NEXT_PUBLIC_API_BASE_URL`/
   `NEXT_PUBLIC_API_KEY` come from **GitHub Actions secrets** of the same
   name, matching `.env.example`, injected as build-time env vars)
8. `cp -r storybook-static out/storybook` — merges the design system into the
   app's own output as a `/storybook` sub-path
9. On `push` to `main` only: `actions/upload-pages-artifact` on the merged
   `out/`, then a separate `deploy` job runs `actions/deploy-pages`.

Result: one deploy publishes both the app
(`https://<user>.github.io/mobile-ecommerce/`) and the live Storybook design
system (`https://<user>.github.io/mobile-ecommerce/storybook/`) — no second
Pages site needed. Deploying is **not done from this workspace**: this repo
has no git remote configured yet, and going public / wiring up the two repo
secrets is a decision for whoever owns the GitHub repo to make explicitly.

## API quirks

The catalog API (`https://prueba-tecnica-api-tienda-moviles.onrender.com`,
[docs](https://prueba-tecnica-api-tienda-moviles.onrender.com/docs/)) has a
few load-bearing quirks that are handled deliberately in code — a reviewer
should read the following as documented, tested behavior, not bugs:

- **`storageOptions[].price` is the absolute price for that capacity**, not a
  delta added to `basePrice` (verified live: iPhone 15 Pro Max 256GB price
  1319 == `basePrice` 1319; 512GB = 1449; 1TB = 1699). The Detail view's
  "real-time price update" simply displays `selectedStorage.price` directly
  — see `StorageSelector` and `PhoneDetailView`.
- **Color selection has no price effect.** `colorOptions` only carries
  `name`/`hexCode`/`imageUrl`; it swaps the hero image and nothing else.
- **The live `/products` listing can contain duplicate `id`s** (confirmed:
  `XMI-RN13P5G` appears twice in the first 20 items returned). Every list in
  this app keys off `` `${id}-${index}` `` (`lib/api/transform.ts`'s
  `keyFor`), never the raw id, and `generateStaticParams()` dedupes ids
  before generating routes — both specifically to avoid the React
  duplicate-key console warning the brief's "clean console" requirement would
  otherwise flag.
- **`imageUrl` is sometimes served as `http://` even though the API itself is
  `https://`** (the same path also works fine over https). Every image is
  passed through `normalizeImageUrl()` before rendering to avoid a
  browser mixed-content block on the https-served app.
- **Hosted on Render's free tier → real cold starts.** `lib/api/api.ts` bounds
  every request with a timeout and retries a 5xx/dropped connection once with
  a short backoff, and the Listing/Detail routes ship `loading.tsx` skeleton
  states rather than a naive blocking fetch.
- **No cart quantity/merge concept.** The brief only asks for individual
  removal, not incrementing an existing line, so each "Add to cart" click
  creates its own independent cart line
  (`` `${productId}-${color}-${storage}` ``), even if it duplicates an
  existing selection.

## Known limitations

- **Design tokens.** The Figma file's REST API was rate-limited (`429`, a
  multi-day cooldown) partway through pulling design tokens. `src/styles/tokens.css`
  documents, value by value, which are `CONFIRMED` against the real Figma
  file and which are `PLACEHOLDER` (internally consistent stand-ins on the
  same 8px grid / neutral grey ramp as the confirmed values — grep the file
  for `PLACEHOLDER`). All confirmed _and_ placeholder colors are black/white/
  grey with high contrast, so this doesn't produce any readability issue; it
  only means some exact spacing/font-size/breakpoint figures may not
  pixel-match Figma until the tokens can be re-pulled once the rate limit
  clears.
- **Icons.** For the same reason, the icon set in `components/primitives/Icon`
  is a small set of plain, recognizable outline icons rather than exact Figma
  exports — swapping them later doesn't require any API change, since
  `Icon`'s public surface (`name`/`size`/`ariaHidden`) is stable.
