-- LinguaFlash Continue Session cross-device sync
begin;

create table if not exists public.linguaflash_study_session (
  user_id uuid primary key references auth.users(id) on delete cascade,
  session jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.linguaflash_study_session enable row level security;

drop policy if exists "lf_session_select_own" on public.linguaflash_study_session;
drop policy if exists "lf_session_insert_own" on public.linguaflash_study_session;
drop policy if exists "lf_session_update_own" on public.linguaflash_study_session;
drop policy if exists "lf_session_delete_own" on public.linguaflash_study_session;

create policy "lf_session_select_own" on public.linguaflash_study_session
for select to authenticated using ((select auth.uid()) = user_id);

create policy "lf_session_insert_own" on public.linguaflash_study_session
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "lf_session_update_own" on public.linguaflash_study_session
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "lf_session_delete_own" on public.linguaflash_study_session
for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.linguaflash_study_session from anon;
revoke all on public.linguaflash_study_session from authenticated;
grant select, insert, update, delete on public.linguaflash_study_session to authenticated;

commit;
notify pgrst, 'reload schema';
