# Version 13.0.0-dev.11 — Repository repair

- Repaired repository structure so Cloudflare Pages receives only website files at the root.
- Moved Worker, D1 migration, Wrangler, and npm files into `cloudflare-worker/`.
- Replaced corrupted manifest with valid PWA JSON.
- Nutrition now merges Version 13 and recovered Version 12.2 records by record ID.
- Preserves Tuesday and newer entries without allowing an empty key to hide recovered meals.
- Includes independent More and Journal navigation.
- Removed the embedded old-data importer so newer local records cannot be overwritten.
- Bumped service-worker cache to dev.11.
