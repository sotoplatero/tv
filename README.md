# Krka TV Dashboards

SvelteKit app that displays dashboard pages on TV screens in a manufacturing
environment. It connects to an **Odoo** ERP over JSON-RPC and is built to run
continuously on large displays, optimized for viewing from a distance.

## Pages

- `/` — index linking to the available dashboards.
- `/time-tracking` — live "avatar roster" of active manufacturing work orders
  (`mrp.workcenter.productivity`): employee photo + name, work order, work
  center, and start time. Auto-refreshes every 30s and shows a live clock.

## Tech

- **SvelteKit 2 + Svelte 5** (runes)
- **Pico CSS** (CDN) + a single global `static/app.css`; light theme forced via
  `data-theme="light"`. TV sizing is driven by root `font-size` breakpoints in
  `app.css` (everything else is `rem`/`em`).
- **Odoo** JSON-RPC client in `src/lib/odoo-client.js`
- **adapter-node**, shipped as a Docker image

## Development

```bash
pnpm install
pnpm dev            # dev server
pnpm dev -- --open  # dev server + open browser
pnpm build          # production build
pnpm preview        # preview the production build
pnpm check          # type checking
```

> This project uses **pnpm**.

## Environment

Copy `.env.example` to `.env` and fill in:

```
ODOO_URL=https://your-odoo-instance.com
ODOO_DATABASE=your_database_name
ODOO_USERNAME=your_api_username
ODOO_PASSWORD=your_api_password
```

Variables are read server-side at runtime via `$env/dynamic/private`. In
production set them in the deploy platform's environment (e.g. Dokploy →
Environment).

## Deployment

Docker multi-stage build (`Dockerfile`, `node:20-alpine`, port 3000), deployed
on Dokploy/Dokku.

- Dokploy: use the **Dockerfile** build type, set the `ODOO_*` vars in the
  Environment tab, and serve over **HTTPS** (required for the screen Wake Lock
  to keep the TV awake).
- pnpm is pinned to `10.0.0` in the Dockerfile to match `pnpm-lock.yaml`.

See [`CLAUDE.md`](./CLAUDE.md) for architecture details and gotchas.
