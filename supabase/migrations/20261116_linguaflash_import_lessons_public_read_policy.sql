-- Avoid requiring anonymous readers to query linguaflash_admins.
drop policy if exists "lf_import_read_published_or_admin" on public.linguaflash_import_lessons;

create policy "lf_import_public_read"
on public.linguaflash_import_lessons for select to anon, authenticated
using (status = 'published');

create policy "lf_import_admin_read_drafts"
on public.linguaflash_import_lessons for select to authenticated
using (
  exists (
    select 1 from public.linguaflash_admins a
    where a.user_id = (select auth.uid())
  )
);
