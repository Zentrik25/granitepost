create or replace function public.check_admin_login_rate_limit(
  p_email text,
  p_ip text
)
returns boolean
language plpgsql
security definer
as $$
declare
  failed_count integer;
begin
  select count(*)
  into failed_count
  from public.admin_login_attempts
  where created_at > now() - interval '15 minutes'
    and success = false
    and (email = lower(trim(p_email)) or ip_address = p_ip);

  return failed_count < 10;
end;
$$;

create or replace function public.record_admin_login_attempt(
  p_email text,
  p_ip text,
  p_success boolean,
  p_reason text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.admin_login_attempts (email, ip_address, success, reason)
  values (lower(trim(p_email)), p_ip, p_success, p_reason);
end;
$$;