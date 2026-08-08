# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Angular 22 e-commerce storefront (zoneless, SSR-enabled) consuming the public REST API at
`https://ecommerce.routemisr.com/api/` (Route Academy's "Route E-Commerce" API — see `src/environments/`).
Styling is Tailwind CSS v4 + PrimeNG (Nora preset) with a custom "royal/gold" luxury theme and
manual light/dark mode. A meaningful portion of code comments in this repo are written in Arabic —
match that when editing nearby code rather than switching the file to English comments.

## Commands

```bash
npm start           # ng serve — dev server at http://localhost:4200
npm run build       # ng build — production build to dist/
npm run watch       # ng build --watch --configuration development
npm test            # ng test — runs Vitest via @angular/build:unit-test
```

There is no lint script configured. Formatting is via Prettier (`.prettierrc`: singleQuote,
printWidth 100, Angular parser for `*.html`).

To run a single test file, use Vitest directly, e.g. `npx vitest run src/app/core/services/cart/cart.spec.ts`.

SSR serve (after building): `node dist/E-Commerce22/server/server.mjs`.

## Architecture

### Layout
- `src/app/core/` — cross-cutting singletons: `services/`, `interceptors/`, `guards/`, `models/`
  (all `I`-prefixed interfaces), `resolvers/`.
- `src/app/features/` — one folder per routed feature (`home`, `shop`, `cart`, `categories`,
  `brands`, `product-details`, `auth`, `reviews`, `not-found`). Nested subfolders hold child
  components (e.g. `home/home-product`, `categories/sub-category/sub-category-products`).
- `src/app/layouts/` — `navbar`, `footer` (app shell, not routed).
- `src/app/shared/` — reusable non-feature-specific pieces (e.g. `breadcrumb`).
- All routes are lazy-loaded via `loadComponent` in `src/app/app.routes.ts`; there are no NgModules.

### Angular 22 conventions used throughout — follow these, don't reintroduce older patterns
- **Standalone-only, no `standalone: true` flag** (it's the default) — never add NgModules.
- **Zoneless** (`provideZonelessChangeDetection()` in `app.config.ts`) — don't rely on
  Zone.js-based change detection; state changes must flow through signals.
- **Signals-first**: component/service state is `signal()`/`computed()`, not RxJS `BehaviorSubject`
  fields. Route/query params are read via `input()` (bound automatically through
  `withComponentInputBinding()`), not `ActivatedRoute` snapshots/subscriptions.
- **`rxResource()`** (`@angular/core/rxjs-interop`) is the standard way to bind an HTTP call to
  component state reactively (see `src/app/features/shop/shop.ts`) — prefer it over manual
  `subscribe()` + signal-set in new components where it fits.
- **`@Service()` decorator** (new in Angular 22, auto-`providedIn: 'root'`) is used for most
  services in `core/services/`; `theme.ts` still uses `@Injectable({ providedIn: 'root' })` —
  both work identically, but prefer `@Service()` for new services to match the majority convention.
- Service **class names are inconsistent** across the codebase (`AuthService`, `BrandsService` vs.
  bare `Cart`, `Theme`) — match the existing name in the file you're editing rather than "fixing" it.

### HTTP / auth flow
- All HTTP calls go through `provideHttpClient(withInterceptors([...]))` in `app.config.ts`, order matters:
  1. `authInterceptor` — attaches `Authorization: Bearer <token>` from `AuthService.getToken()`.
  2. `errorInterceptor` — global toast handling (via PrimeNG `MessageService`) for 401 (logout +
     redirect to `/login`), 403, 0 (connection), 5xx. 400/404/409/422 etc. are intentionally left
     for the calling component to handle in context — don't add global toasts for those.
  3. `loadingInterceptor` — drives the global top-of-page loading bar (`LoadingService`, rendered in `app.html`).
- Note the cart API (`Cart` service) uses a bespoke `token` header instead of the `Authorization`
  bearer header the interceptor sets — this is intentional per the upstream API's contract, not a bug.
- `AuthService` persists `userToken`/`userData` to `localStorage`, guarded by `isPlatformBrowser`
  (SSR-safe) — always guard new `localStorage`/`window`/`document` access the same way; this app
  renders on the server via `provideClientHydration()` + `src/server.ts`.

### Theming
- Dark mode is a single source of truth that **must stay in sync in three places** if ever changed:
  the `my-app-dark` class name in `Theme` (`core/services/theme/theme.ts`), `darkModeSelector` in
  `providePrimeNG` (`app.config.ts`), and `@custom-variant dark (...)` in `src/styles.css`.
- Theme toggling uses the View Transitions API when available (`document.startViewTransition`).
- Tailwind v4 is configured via CSS (`@import 'tailwindcss'`, `@theme` block in `styles.css`) —
  there is no `tailwind.config.js`.

### Breadcrumbs
- Driven by route `data` (`breadcrumb: 'literal'` or `breadcrumb: (data) => string` reading a
  resolver's output, e.g. `categoryName`/`subCategoryName` resolvers) plus `BreadcrumbService`,
  rendered in `app.html`. Routes needing no breadcrumb use `data: { hideBreadcrumb: true }`.
