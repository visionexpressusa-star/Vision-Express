-- Postgres grants EXECUTE on new functions to PUBLIC, which includes signed-out (anon) callers.
-- Remove that, then give back only what signed-in users need.

revoke execute on function public.has_permission(text) from public, anon;
revoke execute on function public.is_active_user() from public, anon;
revoke execute on function public.my_permissions() from public, anon;
revoke execute on function public.referral_counts(timestamptz, timestamptz, text) from public, anon;
revoke execute on function public.referral_months(text) from public, anon;

-- Trigger functions run from their triggers; nobody needs to call them directly.
revoke execute on function public.intake_forms_stamp() from public, anon, authenticated;
revoke execute on function public.prescriptions_stamp() from public, anon, authenticated;

grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.my_permissions() to authenticated;
grant execute on function public.referral_counts(timestamptz, timestamptz, text) to authenticated;
grant execute on function public.referral_months(text) to authenticated;
