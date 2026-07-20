# My Zepbound Journey — Version 8.2.3 Live Main Totals

Day One Edition  
Created by Kevin Wiltz

**One Day. One Choice. One Step at a Time.**

## Version 8 features retained
- Day One sunrise welcome and Begin My Journey ceremony
- Today's Mission and Quick Check-In
- Letter to Future Me
- Journal, weekly meal planner, story, milestones, exercise, and progress
- Gym, gentle-day, and home routines
- Workout logging and previous exercise settings

## New integrated nutrition tracker
- Searchable starter list of common foods
- Manual food and nutrition entry
- Breakfast, lunch, dinner, and snack grouping
- Serving multiplier
- Date-by-date food history
- Automatic daily totals for calories, protein, carbs, sugar, fiber, fat, and sodium
- One-button transfer of the nutrition protein total to the daily check-in
- Local device storage and offline PWA support

## Install
Replace the six repository files with these files and commit:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- README.md

Netlify should redeploy automatically.

## Important
Nutrition values are estimates and can vary by brand, preparation, and serving size. Use package labels when precision matters.

Exercise suggestions are general. Use comfortable ranges and stop or modify movements that cause sharp or increasing shoulder or hip pain.


## Version 8.2 food-log improvements
- Multiple bacon choices: pork, thick-cut, center-cut, turkey, and Canadian bacon
- Multiple egg choices: whole, egg white, hard-boiled, scrambled, fried, and omelet
- Search aliases so broad terms such as “bacon” and “eggs” show all relevant choices
- Separate amount and unit fields
- Supports pieces, slices, eggs, strips, cups, tablespoons, teaspoons, ounces, grams, containers, shakes, and servings
- Nutrition-label serving definition, such as “values are for 3 strips”
- Automatic proportional calculation, such as eating 2 strips when the label is for 3


## Version 8.2.1 correction
- Fixed serving multiplication when the amount eaten changes
- Locked the nutrition serving basis so it cannot accidentally match the amount eaten
- Added live calculated nutrition totals before saving
- Example: 3 thick-cut strips at 70 calories each now shows and logs 210 calories


## Version 8.2.2 display correction
- Added a prominent live calculation directly below Amount and Unit
- Recalculates on typing, Tab/blur, arrow controls, and unit changes
- Clarifies that the top daily totals contain saved foods only
- Added version query strings to force browsers and Netlify to load the newest JavaScript and CSS


## Version 8.2.3 correction
- The large nutrition totals at the top now change immediately when Amount changes
- Live totals include saved foods plus the food currently being entered
- A status label identifies when the totals include an unsaved food
- Pressing Enter while in Amount now saves the food
- After saving, the top totals remain correct and show saved totals
