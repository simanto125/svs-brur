/*
# Editable site name and description

1. Modified Tables
- `settings`: adds `site_name` (text) and `site_description` (text) with the current default wording, so existing rows get values.

2. Security
- No grant changes. The settings table stays closed to browsers. Visitors read these two values through the public submit function and admins save them through the admin function, both using the service role.
*/

ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'Saraswata Vandana Samity';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_description text NOT NULL DEFAULT 'Since 2007, SVS has been a spiritual, cultural, and social welfare organisation at Begum Rokeya University, Rangpur.';
