# My Zepbound Journey — Version 11.2

## New: Personal Dose-Effectiveness Tracker
- Starts a new tracking cycle when “Injection taken today” is saved
- Shows current dose, injection date, and cycle day
- Daily 0–10 ratings for:
  - appetite control
  - craving control
  - comfortable fullness
- Optional daily observation notes
- Seven-day visual trend chart
- Calculates a personal average control score
- Flags a possible fade day when the score first drops below 6 after previously reaching 6 or higher
- Saves all tracking data privately on the device

The tracker records personal observations. It does not estimate the amount of medication in the body, diagnose loss of effectiveness, or recommend changing the prescribed dose or weekly schedule.

## Version 11 features retained
- Smart Dining tab
- One-tap restaurant and grocery logging
- Daily nutrition guidance
- Dining favorites
- Phone-friendly controls
- Version 10 smart food search

## Install/update
Replace all six deployed files:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- README.md

Commit the files, wait for deployment, then fully close and reopen the installed phone app so the Version 11.2 cache loads.


## Version 11.2 — Progress Photos
- New My Progress in Pictures section
- Saves a Google Photos album link locally
- Weekly photo records with date, weight, dose, notes, and photo-added status
- Copy-ready labels for placing on photos
- Week-to-week comparison
- Built-in consistent photo-label guide


## Version 11.2.1
- Fixed the Google Photos Open album control.
- Accepts Google Photos links copied with or without https://.
- Validates and saves the album URL before opening it.
- Uses a real web link for better reliability in installed phone apps.


## Version 11.2.3
- Replaced the album anchor with a true button to prevent accidental app navigation.
- Opens the saved Google Photos album with JavaScript and a same-window fallback.
- Detects incomplete Google Photos share URLs that are missing the required key.
- Recommends copying the album address directly from the browser address bar.


Version 11.2.3 changes the Open album control to a standard browser hyperlink so Google Photos receives the exact saved share URL.


## Version 11.2.4

Added Tillamook Country Smoker Original Smoked Sausages to the built-in food database using the package nutrition label: 1 oz (28 g), 110 calories, 8 g protein, 0 g carbohydrate, 0 g sugar, 0 g fiber, 7 g fat, and 330 mg sodium.


## Version 11.2.5

Added **Tilapia, cooked** to the built-in food database. Default serving: 4 oz cooked (145 calories, 30 g protein, 0 g carbohydrate, 3 g fat, 63 mg sodium). Search terms include tilapia, tilapia fillet, grilled tilapia, baked tilapia, and fish fillet.
