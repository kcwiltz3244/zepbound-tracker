# My Zepbound Journey — Version 12.2

Sprint 1 release candidate: Home and Navigation.

## What changed
- Uses one consistent navigation path for Home cards, bottom navigation, More menu pages, and Return Home buttons
- Keeps the Home page summary-first instead of turning it into a data-entry screen
- Preserves the Version 12.1.1 functional repairs for nutrition, food search, photos, dose effectiveness, injection logging, and seven-day totals
- Corrects all visible version labels and cache-busting file versions
- Updates the service-worker cache so phones and computers load Version 12.2 instead of an older cached build
- Adds safer navigation fallbacks and closes the More menu before changing pages

## Release candidate test focus
1. Open every Home action card
2. Open each item in More
3. Use Return Home on every page
4. Test bottom navigation
5. Confirm food, photo, injection, and effectiveness data still save
