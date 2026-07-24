# Version 13.0.0-dev.2 — Cloud Foundation

- GitHub Pages remains the sole app host.
- Added Cloudflare Worker API with private bearer-token authentication.
- Added D1 synchronized storage for all app data sections.
- Added private R2 storage for progress photos.
- Added automatic synchronization, offline pending journal, Sync Now, cloud setup, and expanded diagnostics.
- Added timestamp-based conflict handling at the data-section level.
- Retained complete local backup and restore.
- No Cloudflare Pages deployment is used.

## Development limitation

This foundation synchronizes each app data section as a versioned unit. A later release can normalize high-volume sections into individual records after cross-device reliability is proven.
