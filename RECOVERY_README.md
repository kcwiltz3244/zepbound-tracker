# Version 13.2.1 Recovery Fixed

This package restores the Version 13.2 stable application and fixes a confirmed cache/version mismatch.

## Confirmed problem
The page requested JavaScript and CSS using `v=13.1.4`, while the service worker pre-cached `v=13.2.0` under a cache still named `mzj-v13-1-8`. That allowed browsers to keep serving mixed generations of the application.

## Fixes in this recovery build
- All page asset URLs now use `13.2.1`.
- The service-worker asset list now uses `13.2.1`.
- The service-worker cache has a new unique recovery name.
- Old `mzj-*` caches are deleted during activation.
- Manifest and visible version labels are aligned.
- No new food-search, journal, photo, storage, or synchronization features were added.

## Safe deployment
Deploy these files together as one complete set. Do not mix them with files from 13.3 or another ZIP. Preserve your JSON backup before deployment and do not press Sync until local data has been verified.
