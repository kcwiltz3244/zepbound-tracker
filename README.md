# My Zepbound Journey — Version 9.0 Nutrition Coach

Day One Edition  
Created by Kevin Wiltz

**One Day. One Choice. One Step at a Time.**

## Existing app retained
- Day One welcome
- Today check-in and mission
- Journal and Letter to Future Me
- Weekly meal planner
- Exercise routines and workout history
- Milestones, story, and weight progress
- Improved flexible food log from Version 8.2.3

## New in Version 9.0
- Home nutrition dashboard
- Daily Coach message based on the current day
- Adjustable calorie, protein, and fiber goals
- Goal progress bars
- Meal-by-meal calorie, protein, and carbohydrate totals
- Recent foods with one-tap reuse
- Favorite foods with one-tap reuse
- Protein Coach with remaining-protein guidance
- Seven-day nutrition summary
- Grocery list with check-off and removal
- Main totals continue updating live while an amount is entered

## Install
Replace these six repository files and commit:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- README.md

Netlify should redeploy automatically. The service-worker cache and asset query strings were changed to Version 9.0.

## Notes
Food data remains stored locally on the device. Nutrition values are estimates and may vary by brand, serving size, and preparation. This release does not yet include live restaurant databases, barcode scanning, or photo recognition.


## Version 9.0.2 mobile correction
- Food matching runs after a brief pause in typing
- Tapping Amount, Unit, or Meal triggers matching on phones
- Tab and Enter still work on computers
- Updated cache and asset versions
