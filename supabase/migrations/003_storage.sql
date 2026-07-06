-- Create storage bucket for knowledge files
insert into storage.buckets (id, name, public)
values ('knowledge', 'knowledge', false)
on conflict (id) do nothing;

-- Allow service role full access (already granted via service_role key)
-- Allow authenticated users to read their own files
create policy "Users can read own knowledge files"
  on storage.objects for select
  using (
    bucket_id = 'knowledge'
    and (storage.foldername(name))[1] in (
      select chatbots.id::text
      from public.chatbots
      where chatbots.profile_id = auth.uid()
    )
  );

-- Allow authenticated users to upload to their own chatbots
create policy "Users can upload knowledge files"
  on storage.objects for insert
  with check (
    bucket_id = 'knowledge'
    and (storage.foldername(name))[1] in (
      select chatbots.id::text
      from public.chatbots
      where chatbots.profile_id = auth.uid()
    )
  );
