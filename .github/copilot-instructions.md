# Copilot Instructions

## Build & Dev Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run lint      # ESLint (flat config)
npm run preview   # Preview production build
```

No test framework is configured.

## Architecture

This is an **educational demo app** showcasing software architecture patterns using React 19 + Vite. It uses the [DummyJSON API](https://dummyjson.com) as a mock backend for auth, products, carts, quotes, todos, and recipes.

### Routing

Flat route structure using React Router v6 (`createBrowserRouter` in `src/routers/index.jsx`). `App.jsx` is the layout parent wrapping all routes with a persistent `NavBar` and `<Outlet />`. The `/profile` route is protected by a `PrivateRoute` guard that checks for an auth token.

### State Management — Zustand

Three Zustand stores in `src/store/`:

| Store | Persist? | Key |
|-------|----------|-----|
| `authStore.js` | Yes (`auth-storage`) | JWT tokens, user data |
| `cartStore.js` | Yes (`cart-storage`) | Shopping cart items |
| `lottoStore.js` | No (manual `localStorage`) | Lotto numbers, dark mode toggle |

Stores use `create()` from Zustand. Auth and cart stores use `persist` middleware from `zustand/middleware`. Components subscribe with selectors: `useCartStore((s) => s.items)`.

### Pattern Demo Pages

The app has three pages that demonstrate architecture patterns, each structured differently:

- **PatternsPage** (`/patterns`) — All pattern demos inline in a single file
- **MethodsPage** (`/methods`) — Each pattern in a separate file under `src/pages/methods/`, lazy-loaded with `React.lazy` + `Suspense`
- **MethodsPage2** (`/methods2`) — React Compiler optimized versions under `src/pages/methods2/`, prefixed `RC_`

Shared demo UI components (`PatternDiagram`, `ProsCons`, `WhenToUse`, `DemoLoading`) and custom hooks (`useFetch`, `useDebounce`) live in `src/pages/methods/shared.jsx`.

### Dark Mode

Zustand store (`lottoStore`) → `App.jsx` applies `dark-mode` class on `document.documentElement` → CSS variables in `index.css` swap under `:root.dark-mode`.

## Key Conventions

- **API calls**: Use the native `fetch` API (not axios, despite it being in dependencies). Error handling pattern: check `res.ok`, throw on failure, manage loading in `finally`.
- **Styling**: Plain CSS files per component (no CSS Modules). Class names follow a BEM-like convention (e.g., `.navbar-brand`, `.modal-overlay`). All colors/shadows use CSS custom properties defined in `index.css` for dark mode compatibility.
- **Exports**: Default exports for components and stores. Named exports for shared utilities and hooks.
- **File naming**: PascalCase `*Page.jsx` for route pages, PascalCase `.jsx` for components, camelCase `.js` for stores.
- **React Compiler**: Enabled via `babel-plugin-react-compiler` in `vite.config.js`. The `methods2/` pattern demos intentionally omit manual `useMemo`/`useCallback` to showcase automatic memoization.
- **Language**: UI text and comments are in Korean. Keep this convention when adding new features.
- **ESLint**: Custom rule — `no-unused-vars` ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`).
