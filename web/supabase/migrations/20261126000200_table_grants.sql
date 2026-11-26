-- Newer Supabase projects do not grant table access to the API roles automatically.
-- Grant exactly what the row level security policies expect, and nothing else.
-- (TRUNCATE in particular ignores row level security, so API roles must never have it.)

revoke all on all tables in schema public from anon, authenticated;

-- Signed-in users: reads everywhere (rows filtered by policies), writes only where a policy allows.
grant select on
    public.permissions,
    public.profiles,
    public.user_permissions,
    public.referral_sources,
    public.checklist_items,
    public.intake_forms,
    public.intake_form_list,
    public.prescriptions,
    public.optical_store_config
to authenticated;

grant insert, update on public.intake_forms to authenticated;
grant insert, update on public.prescriptions to authenticated;
grant update on public.optical_store_config to authenticated;
grant usage on all sequences in schema public to authenticated;

-- The admin-users Edge Function runs as service_role (it bypasses row level security).
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage on all sequences in schema public to service_role;
