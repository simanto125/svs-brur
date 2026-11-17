/*
# SVS Storage Bucket — public media

Creates the `svs-media` storage bucket for member photos, committee photos,
notice documents, and gallery images. Public read, service_role write.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('svs-media', 'svs-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can READ objects
DROP POLICY IF EXISTS "public_read_svs_media" ON storage.objects;
CREATE POLICY "public_read_svs_media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'svs-media');

-- service_role handles uploads (edge function)
-- No public INSERT/UPDATE/DELETE on storage objects
