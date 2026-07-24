# Cloudflare setup — Version 13.0 Development

This release uses Cloudflare for the website, synchronization API, database, and private photo storage. GitHub stores the code and triggers deployments; the app is opened from the Cloudflare Pages address.

## Part 1 — Create the Development Pages project

1. In Cloudflare, open **Workers & Pages**.
2. Choose **Create application** and then **Pages**.
3. Connect the GitHub repository containing My Zepbound Journey.
4. Select the `development` branch as the production branch for this Development project.
5. Framework preset: **None**.
6. Build command: leave blank.
7. Build output directory: `/` if the app files are in the repository root.
8. Deploy and copy the assigned Development address, such as:
   `https://my-zepbound-journey-dev.pages.dev`

Do not connect the Stable branch to this Development project.

## Part 2 — Create D1, R2, and the Worker API

1. Install Node.js on the Windows laptop if needed.
2. Open a terminal inside `cloudflare-worker`.
3. Run:
   `npm install`
4. Sign in:
   `npx wrangler login`
5. Create the D1 database:
   `npx wrangler d1 create my-zepbound-journey-dev`
6. Copy the returned database ID into `cloudflare-worker/wrangler.jsonc`.
7. Create the private R2 bucket:
   `npx wrangler r2 bucket create my-zepbound-journey-photos-dev`
8. In `wrangler.jsonc`, set the bucket name to `my-zepbound-journey-photos-dev`.
9. Replace `PASTE-YOUR-DEVELOPMENT-PAGES-ORIGIN` with the Development Pages origin from Part 1. Use only the origin, with no path and no trailing slash.
10. Create a long private app token:
    `npx wrangler secret put APP_TOKEN`
11. Apply the database migration:
    `npm run migrate:remote`
12. Deploy the Worker:
    `npm run deploy`
13. Copy the resulting `.workers.dev` address.

The APP_TOKEN is never placed in GitHub. The R2 bucket remains private.

## Part 3 — Connect both devices

1. Open the Development Cloudflare Pages app on the laptop.
2. Open **Cloud setup**.
3. Enter the Worker address and APP_TOKEN.
4. Save and test the connection.
5. Open the same Development Pages address on the iPhone.
6. Enter the same Worker address and APP_TOKEN.
7. Save and test the connection.

## Part 4 — First synchronization test

Use test records only:

1. Add one test meal on the iPhone and tap **Sync now**.
2. Open the laptop and tap **Sync now**; confirm the meal appears.
3. Add one test weight on the laptop and sync.
4. Sync the iPhone and confirm the weight appears.
5. Test an offline entry.
6. Test a progress photo last.
7. Compare diagnostics on both devices.

Do not move Version 13.0 to Stable until the entire testing checklist passes.
