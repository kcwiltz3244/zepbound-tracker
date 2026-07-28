# Version 13.3.1 — Complete Food Search + Journal Safeguard

- Keeps USDA FoodData Central and Open Food Facts online search.
- Preserves every food-journal date found in either the Version 13 or legacy nutrition storage copy.
- Merges entries from both copies without discarding unique records.
- Creates a one-time pre-merge safety snapshot under `mzjV1331NutritionSafetySnapshot`.
- Continues dual-writing nutrition entries for safe rollback.
