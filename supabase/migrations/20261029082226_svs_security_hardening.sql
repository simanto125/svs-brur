/*
# SVS Security Hardening

## Summary
Tightens access so that public visitors can only read approved content, all
submissions go through validated server-side functions, and private contact
details are not exposed to the public API.

## Changes
1. Pending submissions (`pending_members`, `pending_committee`) no longer accept
   direct inserts from the browser. Submissions go through the `submit` edge
   function, which validates input, checks the committee passcode and window,
   and uploads photos to storage.
2. `members.email` is no longer readable by public visitors. Other directory
   fields remain readable.
3. The service role is explicitly granted access to every table so the admin
   and submit edge functions can read and write.

## Important notes
- No data is deleted or altered; only privileges and policies change.
- Storage uploads are performed by edge functions using the service role.
*/

-- 1. Close direct public writes to pending submission tables
DROP POLICY IF EXISTS "public_insert_pending_members" ON pending_members;
REVOKE INSERT ON pending_members FROM anon, authenticated;

DROP POLICY IF EXISTS "public_insert_pending_committee" ON pending_committee;
REVOKE INSERT ON pending_committee FROM anon, authenticated;

-- 2. Hide private contact email from public reads
REVOKE SELECT ON members FROM anon, authenticated;
GRANT SELECT (id, name, department, batch, blood_group, phone, whatsapp, permanent_address, photo_url, role, created_at)
  ON members TO anon, authenticated;

-- 3. Service role access for edge functions
GRANT ALL ON settings, members, pending_members, committee, pending_committee,
  advisors, events, festivals, gallery_images, notices, past_committees TO service_role;
