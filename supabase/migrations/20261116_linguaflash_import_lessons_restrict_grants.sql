-- Tighten privileges on the published lesson catalog.
-- RLS still restricts writes to rows authorized by linguaflash_admins.
revoke all privileges on table public.linguaflash_import_lessons from public, anon, authenticated;
grant select (lesson_id, title, language, category, cards, status, created_at, updated_at)
  on public.linguaflash_import_lessons to anon, authenticated;
grant insert (lesson_id, title, language, category, cards, status, updated_at)
  on public.linguaflash_import_lessons to authenticated;
grant update (lesson_id, title, language, category, cards, status, updated_at)
  on public.linguaflash_import_lessons to authenticated;
