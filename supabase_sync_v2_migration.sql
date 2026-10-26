-- LinguaFlash Cloud Sync v2
-- Safe migration: keeps public.linguaflash_user_state untouched as a rollback backup.

begin;

create table if not exists public.linguaflash_user_meta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.linguaflash_card_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

alter table public.linguaflash_user_meta enable row level security;
alter table public.linguaflash_card_progress enable row level security;

drop policy if exists "lf_meta_select_own" on public.linguaflash_user_meta;
drop policy if exists "lf_meta_insert_own" on public.linguaflash_user_meta;
drop policy if exists "lf_meta_update_own" on public.linguaflash_user_meta;
drop policy if exists "lf_meta_delete_own" on public.linguaflash_user_meta;
create policy "lf_meta_select_own" on public.linguaflash_user_meta for select to authenticated using ((select auth.uid()) = user_id);
create policy "lf_meta_insert_own" on public.linguaflash_user_meta for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "lf_meta_update_own" on public.linguaflash_user_meta for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "lf_meta_delete_own" on public.linguaflash_user_meta for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "lf_progress_select_own" on public.linguaflash_card_progress;
drop policy if exists "lf_progress_insert_own" on public.linguaflash_card_progress;
drop policy if exists "lf_progress_update_own" on public.linguaflash_card_progress;
drop policy if exists "lf_progress_delete_own" on public.linguaflash_card_progress;
create policy "lf_progress_select_own" on public.linguaflash_card_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "lf_progress_insert_own" on public.linguaflash_card_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "lf_progress_update_own" on public.linguaflash_card_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "lf_progress_delete_own" on public.linguaflash_card_progress for delete to authenticated using ((select auth.uid()) = user_id);

-- Remove Supabase's broad default privileges from browser roles, then grant only
-- the CRUD operations required by authenticated LinguaFlash users. RLS still
-- enforces ownership for every row.
revoke all on table public.linguaflash_user_meta from anon, authenticated;
revoke all on table public.linguaflash_card_progress from anon, authenticated;
grant select, insert, update, delete on table public.linguaflash_user_meta to authenticated;
grant select, insert, update, delete on table public.linguaflash_card_progress to authenticated;

-- One-time server-side migration of existing legacy state, if the legacy table exists.
do $$
begin
  if to_regclass('public.linguaflash_user_state') is not null then
    insert into public.linguaflash_user_meta (user_id, state, updated_at)
    select
      s.user_id,
      jsonb_build_object(
        'schemaVersion', 2,
        'data', coalesce(s.state->'data', '{}'::jsonb) - 'linguaflash_card_progress_v2',
        'clientUpdatedAt', coalesce(s.state->>'clientUpdatedAt', s.updated_at::text)
      ),
      coalesce(s.updated_at, now())
    from public.linguaflash_user_state s
    on conflict (user_id) do update
      set state = excluded.state,
          updated_at = excluded.updated_at
      where excluded.updated_at >= public.linguaflash_user_meta.updated_at;

    insert into public.linguaflash_card_progress (user_id, card_id, progress, updated_at)
    select
      s.user_id,
      p.key,
      p.value,
      coalesce(s.updated_at, now())
    from public.linguaflash_user_state s
    cross join lateral jsonb_each(
      coalesce(s.state->'data'->'linguaflash_card_progress_v2', '{}'::jsonb)
    ) as p(key, value)
    on conflict (user_id, card_id) do update
      set progress = excluded.progress,
          updated_at = excluded.updated_at
      where excluded.updated_at >= public.linguaflash_card_progress.updated_at;
  end if;
end $$;

commit;

-- Ask PostgREST to refresh its schema cache immediately.
notify pgrst, 'reload schema';