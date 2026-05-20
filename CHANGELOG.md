# Changelog

All notable changes to the KYP widget are documented here.

---

## [Unreleased]

### Added
- Minified build output: `dist/kyp-widget.min.js` (via Terser — ~37% smaller than the unminified bundle)
- `README.md` covering quick-start embed, all script-tag attributes, programmatic API, build workflow, source layout, and expected API shape

### Changed
- Output filenames renamed from `sports-results-widget.*` to `kyp-widget.*`
- Cache TTL unit changed from **minutes** to **days** (`data-cache-days`, default `1`)
- `build.js` made async to support the Terser minification step
- `devDependencies` updated: added `terser ^5`

---

## [1.0.0] — Initial release

### Widget (`src/widget.js`)
- Self-contained IIFE widget; zero runtime dependencies
- Auto-initialises from `<script>` tag attributes (`data-api-url`, `data-api-key`, `data-target`, `data-cache-days`)
- Programmatic API: `SportsWidget.init({ apiUrl, apiKey, target, cacheDays })`
- Leaderboard ranked by points with tie-breaking by gold → silver → bronze count
- Filterable by **gender** (Mens / Womens / Mixed) and **event** (Singles / Doubles) via radio groups
- Player name search with prev/next match navigation and row highlighting
- Clickable player names open a **modal** showing that player's full result history
- Skeleton loading state shown while the first fetch is in progress
- Cached data rendered immediately on load; fresh fetch runs in the background and swaps in via `refreshData()`
- `localStorage` cache with configurable TTL and automatic expiry
- Service Worker registered from a Blob URL to cache API responses at the network layer
- "cached" badge shown on the leaderboard title when serving from cache
- Last-updated timestamp rendered from `data._meta.generated_at`
- Graceful error state if the fetch fails and no cache is available

### Styles (`src/styles.scss`)
- Scoped under `.kyp-root` — no global style leakage
- CSS custom properties for runtime theming (`--c-accent`, `--c-bg`, `--c-text`, etc.)
- Dark mode support via `@media (prefers-color-scheme: dark)`
- Rank badges with distinct gold / silver / bronze colouring for top 3 positions
- Medal cells with emoji icons (🥇 🥈 🥉) and zero-value dash
- Responsive modal with backdrop, scroll lock, and keyboard (`Escape`) / click-outside dismissal
- Alternating row colours, hover states, and focus-visible outlines for accessibility

### Template (`src/template.html`)
- Static HTML skeleton injected into the widget bundle at build time
- `data-sw` attribute hooks used by JS for all dynamic DOM targeting (no class or ID coupling)
- Sections: header/title, gender radio row, event radio row, search row, category label, table wrapper, last-updated meta, modal backdrop + dialog

### Build (`build.js`)
- Node.js build script with no bundler dependency
- Compiles `src/styles.scss` → minified CSS via Sass
- Collapses `src/template.html` to a single line and strips HTML comments
- Injects compiled CSS and template HTML into `src/widget.js` by replacing `"__STYLES__"` and `"__TEMPLATE__"` placeholders
- Outputs `dist/kyp-widget.js` (unminified) and `dist/kyp-widget.css` (standalone stylesheet)
- Watch mode (`--watch`) via `chokidar` for incremental rebuilds

### Infrastructure
- `docker-compose.yml` with Apache/PHP web service, MySQL 8.4 database, and phpMyAdmin
- Docker healthcheck on the database before the web service starts
- `.dockerignore` and `.gitignore`
