# Zepbound Health Dashboard v3

This version expands the original tracker into a health dashboard.

## New in v3

- 7-day editable meal planner
- Balanced, higher-protein, simple, and gentle-on-the-stomach suggestions
- 3-meal or 3-meal-plus-snack options
- Automatically generated shopping list
- Copyable and printable shopping list
- Meal-plan CSV export
- Protein-first and smaller-portion prompts

## Health dashboard features

- Weight, BMI, waist, and milestone tracking
- Zepbound dose, injection site, injection schedule, and pens remaining
- Refill-date alerts
- Blood pressure, glucose, A1C, water, protein, exercise, and sleep
- Side-effect history and most-common symptom
- CSV export
- Printable doctor report
- Optional Google Sheets backup
- Offline support
- Mobile-friendly layout

## Replace the files in GitHub

Upload these files to the root of your existing `zepbound-tracker` repository:

- `index.html`
- `app.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`
- `README.md`

When GitHub asks whether to replace existing files, confirm the replacement and commit the changes.

## Google Sheets setup

1. Create a blank Google Sheet.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the sample code.
4. Copy everything from `google-apps-script.gs` into the editor.
5. Replace `REPLACE_WITH_YOUR_PRIVATE_KEY` with a long private phrase. Keep the quotation marks.
6. Click **Deploy → New deployment**.
7. Select **Web app**.
8. Set **Execute as** to **Me**.
9. Set **Who has access** to **Anyone**.
10. Deploy and approve the requested Google permissions.
11. Copy the web-app URL ending in `/exec`.
12. Open the tracker, choose **Settings**, and enter:
    - The Apps Script web-app URL
    - The same private sync key used in the script
13. Select **Test Connection**.

The spreadsheet itself stays private. The web app accepts data only when the private key matches.

## Important

Entries are always saved locally first. If Google Sheets is temporarily unavailable, entries remain marked `Pending` and are retried later.

This dashboard is for personal organization and does not replace medical advice.


## Meal-planner note

Meal suggestions are general examples rather than a prescribed medical diet. Adjust foods for allergies, kidney disease, diabetes treatment, swallowing problems, or other clinician-directed restrictions.
