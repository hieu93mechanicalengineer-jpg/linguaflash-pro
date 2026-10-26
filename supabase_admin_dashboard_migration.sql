-- LinguaFlash Admin Dashboard backend
-- Creates a secure admin allowlist and aggregate-only dashboard RPC.
-- The live project owner/admin row is assigned separately at deployment time.

create table if not exists public.linguaflash_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner','admin')),
  created_at timestamptz not null default now()
);

alter table public.linguaflash_admins enable row level security;

drop policy if exists "lf_admin_read_self" on public.linguaflash_admins;
create policy "lf_admin_read_self"
on public.linguaflash_admins
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.linguaflash_admins from anon, authenticated;
grant select on public.linguaflash_admins to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.linguaflash_admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_result jsonb;
begin
  if v_uid is null or not exists (
    select 1 from public.linguaflash_admins a where a.user_id = v_uid
  ) then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  with activity as (
    select user_id, max(updated_at) as last_activity from (
      select user_id, updated_at from public.linguaflash_card_progress
      union all
      select user_id, updated_at from public.linguaflash_user_meta
      union all
      select user_id, updated_at from public.linguaflash_study_session
    ) x
    group by user_id
  ),
  daily as (
    select gs::date as day,
           count(u.id)::int as signups
    from generate_series(
      (current_date at time zone 'Asia/Ho_Chi_Minh')::date - 13,
      (current_date at time zone 'Asia/Ho_Chi_Minh')::date,
      interval '1 day'
    ) gs
    left join auth.users u
      on (u.created_at at time zone 'Asia/Ho_Chi_Minh')::date = gs::date
    group by gs::date
    order by gs::date
  )
  select jsonb_build_object(
    'is_admin', true,
    'total_users', (select count(*)::int from auth.users),
    'confirmed_users', (select count(*)::int from auth.users where email_confirmed_at is not null),
    'new_today', (select count(*)::int from auth.users where (created_at at time zone 'Asia/Ho_Chi_Minh')::date = (now() at time zone 'Asia/Ho_Chi_Minh')::date),
    'new_7d', (select count(*)::int from auth.users where created_at >= now() - interval '7 days'),
    'new_30d', (select count(*)::int from auth.users where created_at >= now() - interval '30 days'),
    'active_1d', (select count(*)::int from activity where last_activity >= now() - interval '1 day'),
    'active_7d', (select count(*)::int from activity where last_activity >= now() - interval '7 days'),
    'active_30d', (select count(*)::int from activity where last_activity >= now() - interval '30 days'),
    'users_with_progress', (select count(distinct user_id)::int from public.linguaflash_card_progress),
    'progress_rows', (select count(*)::int from public.linguaflash_card_progress),
    'total_reviews', (
      select coalesce(sum(
        case when coalesce(progress->>'reviewCount','') ~ '^[0-9]+$'
          then (progress->>'reviewCount')::bigint else 0 end
      ),0)::bigint
      from public.linguaflash_card_progress
    ),
    'daily_signups', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'count', signups) order by day), '[]'::jsonb) from daily),
    'generated_at', now(),
    'timezone', 'Asia/Ho_Chi_Minh'
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function private.linguaflash_admin_dashboard_stats() from public, anon;
grant execute on function private.linguaflash_admin_dashboard_stats() to authenticated;

create or replace function public.linguaflash_admin_dashboard_stats()
returns jsonb
language sql
security invoker
stable
set search_path = ''
as $$
  select private.linguaflash_admin_dashboard_stats();
$$;

revoke all on function public.linguaflash_admin_dashboard_stats() from public, anon;
grant execute on function public.linguaflash_admin_dashboard_stats() to authenticated;

notify pgrst, 'reload schema';
