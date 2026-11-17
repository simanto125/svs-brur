/*
# Books library

1. New Tables
- `books`: id, title, author, description, pdf_url, status ('pending' or 'approved'), submitted_by, created_at.

2. Security
- RLS enabled on `books`.
- anon and authenticated can SELECT only rows with status = 'approved'.
- No direct writes from the browser. Viewer submissions and admin changes go through edge functions that use the service role.
*/

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  description text,
  pdf_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  submitted_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS books_status_created_idx ON books (status, created_at DESC);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON books TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON books TO service_role;

DROP POLICY IF EXISTS "public_read_approved_books" ON books;
CREATE POLICY "public_read_approved_books" ON books
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');
