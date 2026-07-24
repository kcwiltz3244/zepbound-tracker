# Version 13.0.0-dev.9 — Nutrition + Journal Consolidation

## Fixed
- Migrates recovered Version 12.2 nutrition records from `mzjV81Nutrition` into the Version 13 canonical nutrition store.
- Dual-writes nutrition during Development so rollback cannot hide records.
- Home and Nutrition screens use the same food-log data source.
- Includes the independent bottom navigation fix for More.
- Includes Journal access, editor, search, favorites, and timeline.
- Retains independent Backup, Restore, Cloud Setup, and Diagnostics controls.
- Adds the navigation script to the service-worker cache and bumps the cache to dev.9.

## Data safety
- This release does not delete or overwrite existing food records.
- Existing Version 12.2/13 records are copied forward on first load.
- Cloud synchronization remains disabled until Cloudflare setup is completed.
