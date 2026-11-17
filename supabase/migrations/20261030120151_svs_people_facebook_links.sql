/*
# Add Facebook links to members and advisors

1. Modified tables
- `members`: new nullable column `facebook_url` (text) for an optional Facebook profile link.
- `advisors`: new nullable column `facebook_url` (text) for an optional Facebook profile link.

2. Security
- No policy or grant changes. Existing RLS and grants on both tables are unchanged.

3. Notes
- Existing rows are untouched; the new column is empty (NULL) until an admin adds a link.
- Columns are added only if they do not already exist, so re-running this migration is safe.
*/

ALTER TABLE members ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS facebook_url text;
