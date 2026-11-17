/*
# Site logo setting

1. Modified tables
- `settings`: new column `logo_url` (text, nullable). Holds the public link to the uploaded website logo. When empty, the built-in logo is shown.

2. Security
- No policy or grant changes. `settings` stays closed to browsers; the admin and submit functions read and write it with the service role.

3. Notes
- Non-destructive: existing rows keep their values, and the new column starts empty.
*/

ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_url text;
