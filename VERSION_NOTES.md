# Version 13.0.0-dev.6 — Recovered Data Included

- Includes the recovered Version 12.2 Zepbound data directly in the build.
- Imports the recovered data once on first launch.
- Creates a local safety snapshot before importing.
- Excludes unrelated Drone Tracker, ClassConnect, Shopify, and debug storage.
- Tuesday nutrition data remains absent because it was not present in the recovered backup.

# Version 13.0 Development — dev.5

- Added a permanent, visible **Restore saved data** button directly to the Home page.
- Restore accepts the original Version 12.2 recovered JSON file as well as Version 13 backups.
- Filters legacy imports to My Zepbound Journey keys only.
- Added `zepboundProcess` records to backup and synchronization inventory.
- Bumped the service-worker cache to dev.5.

# Version 13.0.0-dev.3 — All-Cloudflare Foundation

- Cloudflare Pages is the app host.
- Added Cloudflare Worker API with private bearer-token authentication.
- Added D1 synchronized storage for all app data sections.
- Added private R2 storage for progress photos.
- Added automatic synchronization, offline pending journal, Sync Now, cloud setup, and expanded diagnostics.
- Added timestamp-based conflict handling at the data-section level.
- Retained complete local backup and restore.
- No Cloudflare Pages deployment is used.

## Development limitation

This foundation synchronizes each app data section as a versioned unit. A later release can normalize high-volume sections into individual records after cross-device reliability is proven.
