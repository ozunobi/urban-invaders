drop policy "Anyone can view community images" on storage.objects;

insert into storage.buckets (id, name, public) values ('report-images', 'report-images', false);

create policy "Users upload their own report images" on storage.objects for insert to authenticated
with check (bucket_id = 'report-images' and (storage.foldername(name))[1] = (select auth.jwt()->>'sub'));

create policy "Users see their report images and accepted report images" on storage.objects for select to authenticated
using (
  bucket_id = 'report-images' and (
    (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    or exists (select 1 from public.sighting_reports where photo_url = name and status = 'accepted')
  )
);