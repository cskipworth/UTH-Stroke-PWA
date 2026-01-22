# UTH Stroke PWA — Starter

This is a Progressive Web App commissioned by UTH as a resource for health care professionals in diagnosing and treating stroke. 

Features include:
- Audio files for performing neurological interviews/exams with patients who don't speak English.
- Rating system/calculator that tallies points to determine stroke severity. (Scales will include the NIH Stroke Scale and the Modified Rankin Scale.)
- Score report summary from calculator results from both scales that can be saved or shared in a text format via WhatsApp, text, and email.
- Additional static pages with information for tPA and TNK eligibility criteria and dosing, as well as other miscellaneous information e.g. project team and contact information.

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
