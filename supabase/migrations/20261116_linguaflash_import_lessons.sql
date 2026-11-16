-- Safe, additive lesson catalog for LinguaFlash Import Lessons v1.
-- Existing learning tables, cards, progress and audio are not modified.
create table if not exists public.linguaflash_import_lessons (
  lesson_id text primary key
    check (lesson_id ~ '^[a-z0-9][a-z0-9_-]{2,79}$'),
  title text not null
    check (char_length(btrim(title)) between 1 and 180),
  language text not null check (language in ('en', 'zh')),
  category text not null
    check (char_length(btrim(category)) between 1 and 100),
  cards jsonb not null
    check (jsonb_typeof(cards) = 'array' and jsonb_array_length(cards) between 1 and 500),
  status text not null default 'published'
    check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.linguaflash_import_lessons enable row level security;

create policy "lf_import_read_published_or_admin"
on public.linguaflash_import_lessons for select to anon, authenticated
using (
  status = 'published'
  or exists (
    select 1 from public.linguaflash_admins a
    where a.user_id = (select auth.uid())
  )
);

create policy "lf_import_admin_insert"
on public.linguaflash_import_lessons for insert to authenticated
with check (
  exists (
    select 1 from public.linguaflash_admins a
    where a.user_id = (select auth.uid())
  )
);

create policy "lf_import_admin_update"
on public.linguaflash_import_lessons for update to authenticated
using (
  exists (
    select 1 from public.linguaflash_admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.linguaflash_admins a
    where a.user_id = (select auth.uid())
  )
);

-- Since October 2026 new public tables require explicit Data API grants.
grant select on public.linguaflash_import_lessons to anon;
grant select, insert, update on public.linguaflash_import_lessons to authenticated;
