# Cloudflare Stable / Development Workflow

## Source control
- GitHub remains the master source-code repository.
- Use a `development` branch for all Version 13 work.
- Do not edit or deploy directly from the Stable branch.

## Cloudflare Pages projects
- Development project: connected only to the GitHub `development` branch.
- Stable project: connected only to the tested Stable branch.
- The Development and Stable projects must use different Pages URLs and service-worker cache names.

## Promotion rules
1. Create a complete app backup.
2. Confirm the GitHub commit shown by Cloudflare matches the intended commit.
3. Pass laptop, iPhone, offline, synchronization, backup/restore, and photo tests.
4. Record meaningful version notes.
5. Merge the tested Development release into Stable.
6. Verify the Stable deployment before using it for new records.

The recovered JSON backup remains untouched until Version 13 cloud synchronization and restore testing pass.
