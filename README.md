# UTH Stroke PWA — Starter

This is a minimal Progressive Web App starter scaffold for the UTH Stroke project.

Files added:

- `index.html` — App shell and link to manifest
- `manifest.json` — Web App Manifest
- `sw.js` — Service Worker (caching app shell)
- `src/main.js` — Registers the service worker
- `icons/icon.svg`, `icons/icon-192.svg`, `icons/icon-512.svg` — placeholder icons
- `package.json` — simple scripts to start a local server

Quick start (local test):

1. From the repo root run one of these:

   Using Python (no install required):

   ```bash
   npm run start  # runs `python3 -m http.server 8080`
   ```

   Or (if you prefer http-server):

   ```bash
   npm run start:npx
   ```

2. Open http://localhost:8080 in your browser.
3. Open DevTools -> Application to inspect the manifest and service worker.

Notes:
- For production you should serve over HTTPS and replace the placeholder icons with proper PNGs at multiple sizes (192x192, 512x512).
- This skeleton is intentionally minimal. Expand caching rules, update lifecycle handling, and add a proper offline page as needed.
