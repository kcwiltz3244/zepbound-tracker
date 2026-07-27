{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-zepbound-journey-dev-sync",
  "main": "src/index.js",
  "compatibility_date": "2026-07-23",
  "d1_databases": [{"binding":"DB","database_name":"my-zepbound-journey-dev","database_id":"PASTE_D1_DATABASE_ID_HERE","migrations_dir":"migrations"}],
  "r2_buckets": [{"binding":"PHOTOS","bucket_name":"my-zepbound-journey-photos-dev"}],
  "vars": {"ALLOWED_ORIGIN":"https://PASTE-YOUR-DEVELOPMENT-PAGES-ORIGIN"}
}
