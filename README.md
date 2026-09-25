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

### Data fetching: TanStack (React) Query over a direct API client

There are two layers, and the split matters:

- `lib/api/api.ts` is a thin **transport**: it builds the request, attaches the
  `x-api-key` header, bounds it with a timeout, retries a dropped/5xx request
  with a backoff (Render free-tier cold starts), and turns a non-OK response
  into a typed `ApiError` carrying the API's own `{ error, message }`. It has
  no cache and no React in it, so the same function runs at build time and in
  the browser.
- `lib/api/queries.ts` is the **cache contract**: one `queryOptions` per
  endpoint, with the query keys everything else shares.

Each route's Server Component prefetches into a throwaway `QueryClient` at
build time and serializes it into `<HydrationBoundary>`; the Client Component
below reads the same key with `useQuery`. Because the keys match (and
`staleTime` keeps hydrated data fresh), the browser renders the build's data
without re-requesting it on mount — the static export still ships fully
populated HTML — and from then on React Query owns every request: one cache
entry per `search` value, deduplicated, with `keepPreviousData` holding the
current grid on screen while the next search resolves. Navigating
listing → detail → back is served from that cache, not the network.

There are no Route Handlers in between (`output: 'export'` has no server to
run them), so the `queryFn` calls the external API directly from both sides.
`src/lib/query/` holds the provider and the client factory — one client per
server render, one long-lived client in the browser.

### Colour variants: prefetched, pre-decoded, previewed in CSS

The Detail view never fetches an image in response to an interaction. Every
colour variant's `<img>` is in the statically exported HTML with
`loading="eager"`, so the browser's preload scanner requests the whole set
during parse, before any JavaScript runs — the selected one at
`fetchPriority="high"`, the rest at `low`, so cache-warming can't delay LCP.
The hidden variants are `opacity: 0`, not `display: none`, so they are painted
(and therefore decoded); `PhoneHero` also calls `img.decode()` on each one to
make that a guarantee rather than a browser behaviour.

Previewing a colour on hover is then **pure CSS, with no React state at all**.
A `:has()` rule in `PhoneDetailView.module.css` reads the hovered swatch and
flips which already-decoded image is opaque:

```css
.layout:has([data-color-index="3"]:hover) [data-variant-index="3"] {
  opacity: 1;
}
```

`.layout` is the nearest ancestor of both the swatches and the hero, which is
why the rules live there; they match `data-` attributes rather than class names
because CSS Module names are hashed per file and wouldn't resolve across them.
The pairing is positional — `PhoneDetailView` builds the swatch list and the
variant list from `product.colorOptions` in order and never dedupes, so index
_n_ means the same colour on both sides. That is also the one part a unit test
can check here, and it does; the rule itself needs a real browser, since jsdom
can't evaluate `:has()` with `:hover`.

Doing it in CSS means hovering triggers no render, no handler and no state, so
a preview structurally cannot leak into what gets added to the cart, and the
hero's `alt` stays pinned to the selected colour instead of churning on every
pointer move. The whole block sits behind
`@media (hover: hover) and (pointer: fine)` so a tap can't leave a swatch stuck
in a phantom `:hover`.

### One state for "selected", seeded from the cart

`PhoneDetailView` holds exactly one piece of state — `chosen`, what the user
picked on this visit. Everything rendered is derived from it, per field:

```
selection  =  chosen  ->  the cart's most recent line for this phone  ->  null
heroColor  =  selection.color  ->  the first colour
```

so the persisted choice and the live one are the same value rather than two
states kept in sync. Consequences worth knowing:

- **The cart is read through `useCart()`, never `localStorage` directly.** This
  route is prerendered at build time, so reading storage during render would
  make the server HTML and the first client render disagree — a hydration
  warning, which the brief's clean-console requirement forbids. `CartProvider`
  already does that read exactly once, after mount.
- **Showing a colour is not selecting one.** Both fields start `null`, so
  Add-to-cart stays gated on the pair, exactly as the brief asks. The hero
  still needs an image though, so `heroColor` derives its own fallback to the
  first option — that fallback never reaches `selection`, the swatches'
  `aria-checked`, or the cart.
- **The colour-name label can't shift the layout.** It always renders a name
  (the selected one, or the first colour as a stand-in) so its line box exists
  from the first paint, and CSS hides it with `visibility: hidden` while no
  swatch is `aria-checked` — which also keeps it out of the accessibility tree,
  so no colour is announced as chosen before one is. That reads the
  `aria-checked` the swatches already publish, so it costs no extra prop, state
  or modifier class.
- **A cart line does select**, both fields, so returning to a phone you already
  added shows it checked and the button live (you did choose it before).
- **A stale cart line can't resurrect a dead variant.** Colour and storage are
  looked up by name/capacity against the _current_ options, so a discontinued
  one falls through to the default.
- **Picking one field promotes the whole derived selection into state**, so the
  field the user didn't touch keeps whatever it had resolved to.

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
│  ├─ layout.tsx              # <QueryProvider><CartProvider><Header/>…, global font/reset
│  ├─ page.tsx / loading.tsx  # "/" — Listing (Server Component: prefetches + hydrates first 20 at build)
│  ├─ phones/[id]/            # Detail — generateStaticParams() over all product ids
│  ├─ cart/page.tsx           # "/cart" — pure client CartContext consumer
│  └─ integration.test.tsx    # Listing -> Detail -> Cart walk-through (see Testing)
├─ components/
│  ├─ primitives/             # Button, Icon, Badge, Skeleton, Price — app-agnostic building blocks
│  ├─ shared/ProductTile/     # reused by the listing grid AND Detail's "Similar products"
│  ├─ layout/Header/          # global nav bar, reads useCart() itself
│  ├─ listing/                # SearchBar, ResultsCount, PhoneGrid, EmptyState
│  ├─ detail/                 # PhoneDetail (React Query boundary), PhoneHero, Color/StorageSelector, SpecsList, AddToCartButton, SimilarProducts
│  └─ cart/                   # CartList, CartItem, CartSummary
├─ context/CartContext.tsx    # the only piece of app state; localStorage-persisted
├─ lib/
│  ├─ api/{types,api,transform}.ts  # direct-to-external-API transport + documented quirk workarounds
│  ├─ api/queries.ts                # React Query keys + queryOptions (the shared cache contract)
│  ├─ query/                        # QueryClient factory + the client-side QueryProvider
│  └─ utils/useDebouncedValue.ts
├─ styles/{tokens.css,reset.css}    # CSS custom properties + a small reset
├─ test/                            # test-only helpers (renderWithQuery, request tracking)
└─ types/cart.ts

mocks/                    # recorded API responses + the MSW handlers that serve them
├─ products.json          # GET /products
├─ products_id.json       # GET /products/{id}
├─ not_found.json         # 404 body
├─ invalid_key.json       # 401 body
├─ fixtures.ts            # typed re-exports; `satisfies` pins them to lib/api/types.ts
├─ handlers.ts            # MSW handlers (auth + search/limit/offset) and failure scenarios
└─ server.ts              # setupServer() used by vitest.setup.ts

bruno/                    # Bruno collection used to record the responses above
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

Vitest + React Testing Library, `jsdom` environment, **MSW** at the network
boundary. As of this writing: 33 test files, 158 tests.

### The network is mocked; the app is not

No test stubs `fetch`, and no test mocks `lib/api/api.ts`. Instead
`vitest.setup.ts` starts the MSW server in `mocks/server.ts` for the whole
suite, with `onUnhandledRequest: "error"` so a request no handler covers fails
the test loudly rather than escaping to the real network.

What MSW serves are **recorded responses**, not invented ones: the JSON files
in `mocks/` were captured from the live API with the Bruno collection in
`bruno/`, and `mocks/fixtures.ts` asserts each one `satisfies` the matching
type in `lib/api/types.ts` — so a change to the recorded payload that no
longer matches the types is a compile error, and a type that drifts from the
real payload can't pass unnoticed.

The handlers are a faithful fake rather than a lookup table: they check the
`x-api-key` header, and they implement `search`/`limit`/`offset` the way the
real endpoint does. So "searching for iphone returns the two iPhones" is
decided by the same server-side filtering the app depends on, and the real
request-building, retry and error-parsing code in `api.ts` runs in every test.
Failure modes are opt-in per test via `server.use(...scenarios.x())` —
`invalidApiKey`, `productNotFound`, `serverError`, `networkError`.

What's covered:

- **`CartContext`**: empty initial state, `addItem`'s exact `cartItemId`
  shape, no-merge-by-design, `removeItem`, `itemCount`/`totalPrice`
  derivation, localStorage round-trip, and that corrupt/missing JSON in
  storage never throws.
- **Primitives**: disabled-button blocks `onClick`, icon-per-`name`,
  zero-count badge renders nothing, price formatting.
- **The API contract** (`lib/api/api.test.ts`): the recorded list and detail
  shapes, the `x-api-key` header, server-side `search` (by name and by brand,
  case-insensitively — the catalog really does contain both `Xiaomi` and
  `XIAOMI`), `limit`/`offset` paging, a 404 resolving to `null` rather than
  throwing, a 401 surfacing as an `ApiError` carrying `UNAUTHORIZED`, and the
  5xx retry path.
- **The cache contract** (`lib/api/queries.test.ts`): that the key a page
  prefetches is byte-for-byte the key its Client Component reads, including
  normalized defaults, and that a server-side prefetch survives
  dehydrate → hydrate. A mismatch here is invisible in the rendered output but
  silently doubles every request, so it gets its own tests.
- **Listing**: renders the prefetched page from the hydrated cache **with no
  request on mount**, searches through the API and renders what the API
  actually returned, keeps the previous grid on screen mid-search, serves a
  repeated search from cache without a second request, results-count
  text/`aria-live`, the empty state, the error state after the retries are
  exhausted, an invalid key reported as a failure (not as an empty catalog),
  and no duplicate-key warning against the _known_ duplicate-id data.
- **Detail selection and hover preview**: that the hero shows the first colour
  while nothing is selected, and that the name label still renders its line so
  selecting cannot shift the layout; that Add-to-cart is gated on both fields;
  that a cart line for this phone
  seeds both fields, that the _most recent_ line wins, and that a line naming a
  discontinued variant is ignored; that picking one field keeps the other. For
  the hover preview, the `:has()` rule itself needs a real browser, so the
  tests pin the positional `data-color-index`/`data-variant-index` pairing it
  matches on, and assert that hovering changes nothing in React. `PhoneHero`
  additionally asserts every variant is rendered, pre-decoded, and that
  changing the active variant reuses the **same DOM nodes** rather than
  remounting — the guarantee that a swap is an opacity flip, never a refetch.
- **Detail**: colour click swaps the hero image `src`; storage click updates
  the displayed price to that tier's absolute price — exercised against the
  recorded product whose cheapest tier (256 GB, 1229) is _below_ `basePrice`
  (1329), which a `basePrice + delta` reading would get wrong; the hero comes
  from `colorOptions` because the recorded detail response has no top-level
  `imageUrl`; "Add to cart" stays disabled until both are picked, then calls
  `addItem` exactly once with the right payload; specs render all 8 fields;
  similar products render with correct hrefs. `PhoneDetail`, the React Query
  boundary, additionally covers a cold cache, a since-deleted product (404)
  and a failed request.
- **Cart**: every item field renders, remove calls `removeItem` and the row
  disappears, the total recalculates, and the zero state is the same screen —
  heading back to "Cart (0)", no rows, and the action bar still in place with a
  0 total rather than being swapped for a bespoke empty page.
- **`src/app/integration.test.tsx`**: the one true end-to-end walk across all
  three views sharing a single `CartProvider` **and** a single
  `QueryClientProvider` — search the listing,
  click a card, land on the exact product's Detail page, select color +
  storage, add to cart, switch to the Cart view and verify the line item has
  the _selected_ color/storage/price (not defaults), remove it, and see the
  zero state. A second case walks back to the listing and asserts the catalog
  came from the shared query cache rather than a fresh request. This is the
  seam three independently-built view "workstreams" can't verify on their own.
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

Every one of them is pinned to a recorded response in `mocks/` and exercised
by the test suite through MSW, so they can't silently stop being true.

- **`storageOptions[].price` is the absolute price for that capacity**, not a
  delta added to `basePrice` — and it can be _lower_ than `basePrice`
  (recorded: Galaxy S24 Ultra `basePrice` 1329, but 256 GB = 1229, 512 GB =
  1329, 1 TB = 1529). The Detail view's "real-time price update" simply
  displays `selectedStorage.price` directly — see `StorageSelector` and
  `PhoneDetailView`.
- **`GET /products/{id}` returns no top-level `imageUrl`.** Only the listing
  shape carries one. Every image on the Detail route therefore comes from
  `colorOptions[].imageUrl`, which is why `ProductDetail` deliberately does
  _not_ extend `ProductListItem` in `lib/api/types.ts`.
- **Brand casing is inconsistent** — the catalog contains both `Xiaomi` and
  `XIAOMI` — so any brand matching (including the API's own `search`) has to
  be case-insensitive.
- **Two differently-named colours can share one photo.** `PhoneHero` therefore
  addresses variants by colour _name_, never by image URL: deduping by URL
  would collapse the pair, so previewing the second colour would show the
  first one's image. Two variants with the same `src` render as two `<img>`
  elements and the browser coalesces them into one request.
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
