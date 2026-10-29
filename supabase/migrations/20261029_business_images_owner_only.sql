-- business-images: before, any signed-in user could upload any file (any type, any size) to this
-- public bucket. Now: images only, max 5 MB, and each user writes only into a folder named after
-- their user id (the site uploads to "<user id>/<file>"). Existing files stay where they are.
update storage.buckets
set file_size_limit = 5 * 1024 * 1024,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'business-images';

drop policy if exists "Authenticated users can upload business images" on storage.objects;
create policy "Users upload business images into their own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'business-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- Kept: "Anyone can view business images" (public read). No update/delete policies exist.
