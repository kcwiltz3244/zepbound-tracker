# Version 13.1.5 — Search Cache Root Fix

This patch fixes the root cause found during code inspection:

- `index.html` was still requesting Version 13.0 JavaScript and CSS cache keys.
- The service worker cached Version 13.1.3 under different URLs than the page requested.
- A browser could therefore keep running the older food-search code even after a new deployment.

Changes:
- All page asset URLs now use `?v=13.1.5`.
- The service worker uses a new cache and network-first, no-store behavior for app code.
- Everyday local foods are rendered before the online request begins.
- Online canned, bottled, jarred, and branded results are appended underneath.
- The food-search badge visibly says `Everyday first · 13.1.5` so the loaded code can be verified..
