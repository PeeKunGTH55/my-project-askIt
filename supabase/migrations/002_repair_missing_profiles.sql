begin;

-- Repair users that existed before the profile trigger was installed.
insert into public.profiles (id, display_name, avatar_url)
select
  id,
  left(coalesce(nullif(btrim(raw_user_meta_data->>'full_name'), ''), nullif(btrim(raw_user_meta_data->>'name'), ''), nullif(split_part(email, '@', 1), ''), 'User'), 80),
  raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;

-- A safe, idempotent repair path for authenticated sessions. The caller can only
-- create the profile matching auth.uid(); no user id is accepted as an argument.
create or replace function public.ensure_my_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user auth.users%rowtype;
  result public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into auth_user from auth.users where id = auth.uid();
  if auth_user.id is null then
    raise exception 'Authenticated user not found';
  end if;

  insert into public.profiles (id, display_name, avatar_url)
  values (
    auth_user.id,
    left(coalesce(nullif(btrim(auth_user.raw_user_meta_data->>'full_name'), ''), nullif(btrim(auth_user.raw_user_meta_data->>'name'), ''), nullif(split_part(auth_user.email, '@', 1), ''), 'User'), 80),
    auth_user.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url)
  returning * into result;

  return result;
end;
$$;

revoke all on function public.ensure_my_profile() from public, anon;
grant execute on function public.ensure_my_profile() to authenticated;

commit;
