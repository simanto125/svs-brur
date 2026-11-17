/*
# Lock direct writes on people tables

1. Problem
- The members, committee and advisors tables granted INSERT, UPDATE, DELETE and TRUNCATE to the public (anon) and signed-in (authenticated) roles.
- No row-level policy allows those writes, but TRUNCATE is not filtered by row-level security, so a public visitor could empty a whole table.

2. Change
- Revoke every privilege except SELECT from anon and authenticated on members, committee and advisors.

3. Unaffected
- Public read pages keep their existing SELECT access.
- All writes already go through the admin and submit server functions, which use the service role and are not affected by these grants.

4. Notes
- Safe to re-run: revoking a privilege that is already absent does nothing.
*/

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON members FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON committee FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON advisors FROM anon, authenticated;
