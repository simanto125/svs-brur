/*
# Download counts for books and notices, larger PDF limit

1. Modified tables
- `books`: new column `download_count` (integer, default 0). Counts how many times a book's PDF was opened or downloaded.
- `notices`: new column `download_count` (integer, default 0). Same meaning for notice files.

2. New function
- `bump_download(p_kind, p_id)`: adds 1 to the matching row's counter and returns the new total.
  - `book` only counts approved books.
  - `notice` counts any notice.
  - Callable only by the server (service_role). Browsers cannot call it directly.

3. Storage (`svs-media` bucket)
- Maximum file size raised to 50 MB so large book PDFs can be uploaded directly to storage.
- Allowed file types limited to JPG, PNG, WEBP and PDF.
- Existing public-read policy is unchanged.

4. Notes
- Nothing is deleted or retyped. Existing rows get a counter of 0.
*/

ALTER TABLE books ADD COLUMN IF NOT EXISTS download_count integer NOT NULL DEFAULT 0;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS download_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.bump_download(p_kind text, p_id uuid)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF p_kind = 'book' THEN
    UPDATE books SET download_count = download_count + 1
    WHERE id = p_id AND status = 'approved'
    RETURNING download_count INTO new_count;
  ELSIF p_kind = 'notice' THEN
    UPDATE notices SET download_count = download_count + 1
    WHERE id = p_id
    RETURNING download_count INTO new_count;
  ELSE
    RAISE EXCEPTION 'Unknown download kind';
  END IF;
  RETURN new_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bump_download(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_download(text, uuid) TO service_role;

UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'svs-media';
