# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit application designed to display dashboard-style pages on TV screens. The primary purpose is to show real-time information on large monitors/TVs in a manufacturing environment.

The application connects to an Odoo ERP system via JSON-RPC to display manufacturing work order tracking data. It's built to run continuously on TV displays with automatic refresh and optimized for viewing from a distance.

## Package Manager

This project uses **pnpm** (not npm or yarn). Always use pnpm for package management.

## Development Commands

```bash
# Start development server
pnpm dev

# Start dev server and open in browser
pnpm dev -- --open

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Type checking in watch mode
pnpm check:watch
```

## Architecture

### Tech Stack
- **Framework**: SvelteKit 2 with Svelte 5 (using runes: `$state`, `$props`, `$derived`, etc.)
- **Styling**: [Pico CSS](https://picocss.com/) v2 (classless, loaded from CDN in `+layout.svelte`) plus a single global stylesheet `static/app.css`. The light theme is forced via `data-theme="light"` in `src/app.html` so Pico's auto dark-mode never flips the TV.
  - NOTE: `tailwindcss` is present in `devDependencies` but is **not** wired up or used — styling is Pico + `app.css`.
- **Build Tool**: Vite
- **Type Checking**: TypeScript/JSDoc (jsconfig.json with checkJs enabled)
- **Deployment**: `@sveltejs/adapter-node`, built into a Docker image (see Deployment). Runs on Dokploy/Dokku.

### Key Application Structure

**Core Functionality:**
- Home route (`/routes/+page.svelte`): a simple index that links to the available dashboards.
- Time-tracking route (`/routes/time-tracking/`): the TV dashboard showing active manufacturing work orders.
  - `+page.server.ts`: server-side data fetching from Odoo (work-order productivity records + employee avatars).
  - `+page.svelte`: full-screen, TV-optimized "avatar roster" table with auto-refresh and a live clock.

**Odoo Integration (`src/lib/odoo-client.js`):**
- Custom OdooClient class for JSON-RPC communication
- Authenticates with Odoo and fetches data from `mrp.workcenter.productivity` model
- Methods: `authenticate()`, `searchRead()`, `read()`, `search()`
- Uses `createOdooClient()` factory function. Environment variables are read at **runtime** via `$env/dynamic/private` (see below) and validated on client creation.
- Employee photos are fetched separately with `read('hr.employee', ids, ['image_128'])` and returned as base64 (rendered as a `data:image/png;base64,...` `<img>`); falls back to a colored initials circle when an employee has no photo. (Requires the API user to have read access to `hr.employee`.)

**Environment Variables:**
Required variables (in `.env` locally, or set in the deploy platform's environment for production):
- `ODOO_URL`: Odoo instance URL
- `ODOO_DATABASE`: Odoo database name
- `ODOO_USERNAME`: Odoo API username
- `ODOO_PASSWORD`: Odoo API password

Accessed via SvelteKit's **`$env/dynamic/private`** (server-side, read at runtime). This is deliberate: `$env/static/private` inlines values at *build* time, but the containerized Dokploy deploy injects env vars at *runtime* — using the static import resulted in empty values and a "Missing required Odoo environment variables" error. A `.env.example` template is committed at the repo root.

### TV Display Features
- **Auto-refresh**: data reloads every 30s via `invalidate('app:time-tracking')` (no full page reload). A header clock updates every second.
- **Wake Lock**: handled app-wide in `+layout.svelte` — it requests a screen wake lock and **re-acquires it on `visibilitychange`** (browsers release the lock when the page is hidden). NOTE: the Wake Lock API only works over **HTTPS** (a secure context); over plain HTTP `navigator.wakeLock` is undefined and the screen will sleep. Many TVs also have their own OS-level screensaver/sleep that must be disabled in the TV settings.
- **Responsive sizing for screens**: the whole UI is sized in `rem`/`em`, scaled by a handful of root `font-size` breakpoints in `app.css` (1440 / 1920 / 2560 / 3000 / 3840px). Tune those values to rebalance every screen at once. Caveat: viewport width alone can't tell a 27" monitor from a same-resolution TV.
- **Layout**: "avatar roster" table — Employee (photo + name) first, then Work Order (widest column), Work Center, and Started (start time only, right-aligned). Fixed table layout + `nowrap`/ellipsis guarantees every row stays on a single line. Zebra striping on alternating rows.

## Deployment

Deployed to **Dokploy** via Docker (multi-stage `Dockerfile`). Dokploy builds from the GitHub repo, so a push to `main` (`git push origin main`) is what triggers a deploy.

### Dokploy
- Build type: **Dockerfile** (not Railpack). If Railpack is used it fails copying `.env.example`, which is why that template is committed.
- Set the four `ODOO_*` variables in **Dokploy → app → Environment** (runtime env — they are read at runtime via `$env/dynamic/private`, so build args are NOT required).
- Serve the app over **HTTPS** (Dokploy domain + Let's Encrypt) so the Wake Lock API works on the TV.

### Dockerfile notes
- Multi-stage build on `node:20-alpine` (build stage → production stage), exposes port 3000.
- pnpm is **pinned**: `RUN npm install -g pnpm@10.0.0` in both stages (matches `pnpm-lock.yaml` v9.0 / local pnpm 10). This replaced `corepack prepare pnpm@latest`, which broke the build — `pnpm@latest` (now v11) drifted from the lockfile and corepack hit signature/fetch issues on Alpine. Keep this pin in sync with the lockfile.

## Important Notes

**MCP Server:** Svelte MCP server is configured in `.mcp.json` for enhanced Svelte development assistance.

**Path Aliases:**
- `$lib` → `src/lib`
- Standard SvelteKit path aliases apply

## Coding Patterns

- Use Svelte 5 runes syntax (`$state`, `$props`, `$derived`, etc.)
- Server-side data loading via `+page.server.ts` with `PageServerLoad` type
- TypeScript types imported from `./$types` (SvelteKit generated)
- Component props use `let { data }: { data: PageData } = $props()`
