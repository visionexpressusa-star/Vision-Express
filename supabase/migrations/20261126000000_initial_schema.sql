-- Vision Express internal portal: Supabase (Postgres) schema.
-- Ported from the Spring Boot / MySQL Flyway migrations V0-V9.
-- Login, passwords and sessions move to Supabase Auth; everything else lives here
-- and is protected by row level security.

------------------------------------------------------------------------------
-- Users, roles and permissions
------------------------------------------------------------------------------

create table public.permissions (
    id bigint generated always as identity primary key,
    name text not null unique,
    description text not null
);

insert into public.permissions (name, description) values
    ('users', 'Manage users'),
    ('intake_form', 'Manage intake forms'),
    ('provide_prescription', 'Provide prescriptions'),
    ('inventory_check', 'Perform inventory checks'),
    ('optical_store_config', 'Manage optical store estimator configuration');

-- One row per Supabase Auth user. Users sign in with a username; the Auth
-- account behind it uses the e-mail <username>@ve-internal.local.
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    username text not null unique,
    display_name text not null,
    role text not null default 'NON_ADMIN' check (role in ('ADMIN', 'NON_ADMIN')),
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create table public.user_permissions (
    user_id uuid not null references public.profiles (id) on delete cascade,
    permission_id bigint not null references public.permissions (id) on delete cascade,
    primary key (user_id, permission_id)
);

-- True when the signed-in user is active and is an admin or holds the permission.
create or replace function public.has_permission(permission_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.active
          and (
              p.role = 'ADMIN'
              or exists (
                  select 1
                  from public.user_permissions up
                  join public.permissions perm on perm.id = up.permission_id
                  where up.user_id = p.id
                    and perm.name = permission_name
              )
          )
    );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.profiles where id = auth.uid() and active);
$$;

-- Permission names for the signed-in user (ADMIN gets every permission).
create or replace function public.my_permissions()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
    select perm.name
    from public.permissions perm
    join public.profiles p on p.id = auth.uid() and p.active
    where p.role = 'ADMIN'
       or exists (
           select 1 from public.user_permissions up
           where up.user_id = p.id and up.permission_id = perm.id
       );
$$;

------------------------------------------------------------------------------
-- Lookups
------------------------------------------------------------------------------

create table public.referral_sources (
    id bigint generated always as identity primary key,
    name text not null unique,
    sort_number int not null
);

insert into public.referral_sources (name, sort_number) values
    ('Walk-In/MiTienda', 1),
    ('Friend or Family', 2),
    ('Google', 3),
    ('Vision Express Website', 4),
    ('Facebook', 5),
    ('Instagram', 6),
    ('VPS Portal', 7),
    ('EyeMed Portal', 8),
    ('Spectera Portal', 9),
    ('Versant Portal', 10),
    ('Medicare Portal', 11),
    ('Medicaid Portal', 12),
    ('Yearly Reminder Call', 13),
    ('Other', 14);

create table public.checklist_items (
    id bigint generated always as identity primary key,
    sort_number int not null,
    checklist_item text not null
);

insert into public.checklist_items (sort_number, checklist_item) values
    (1, 'Go to Records and Check-off New or Established Patient?'),
    (2, 'Obtained Patient ID & Insurance ID?'),
    (3, 'Scanned Patient ID & Insurance ID?'),
    (4, 'Obtained consent on tablet and imported on Crystal?');

------------------------------------------------------------------------------
-- Intake forms and refractions
------------------------------------------------------------------------------

create table public.intake_forms (
    id bigint generated always as identity primary key,
    account_id bigint not null,
    full_name text not null,
    is_retinal_imaging_required boolean not null default false,
    is_doing_eyeglasses boolean not null default false,
    is_doing_contact_lens boolean not null default false,
    has_insurance boolean not null default false,
    is_aided boolean not null default false,
    pd_left numeric(3, 1) not null check (pd_left >= 0),
    pd_right numeric(3, 1) not null check (pd_right >= 0),
    va_right text not null check (va_right in ('20/20','20/25','20/30','20/40','20/50','20/60','20/70','20/80')),
    va_left text not null check (va_left in ('20/20','20/25','20/30','20/40','20/50','20/60','20/70','20/80')),
    va_both text not null check (va_both in ('20/20','20/25','20/30','20/40','20/50','20/60','20/70','20/80')),
    insurance_name text,
    referral_source_id bigint not null references public.referral_sources (id),
    created_by text,
    created_by_user_id uuid references public.profiles (id),
    created_on timestamptz not null default now()
);

create index intake_forms_created_on_idx on public.intake_forms (created_on desc, id desc);

-- One refraction per intake form; the lens recommendation is stored on the same row.
create table public.prescriptions (
    id bigint generated always as identity primary key,
    intake_form_id bigint not null unique references public.intake_forms (id) on delete cascade,
    nct_right numeric(3, 1) check (nct_right >= 0),
    nct_left numeric(3, 1) check (nct_left >= 0),
    od_sph text, od_cyl text, od_axis text, od_add text,
    od_remarks int check (od_remarks between 20 and 80),
    os_sph text, os_cyl text, os_axis text, os_add text,
    os_remarks int check (os_remarks between 20 and 80),
    ou_remarks int check (ou_remarks between 20 and 80),
    c_od_sph text, c_od_cyl text, c_od_axis text, c_od_add text,
    c_od_bc text, c_od_dia text, c_od_lens_mo text,
    c_os_sph text, c_os_cyl text, c_os_axis text, c_os_add text,
    c_os_bc text, c_os_dia text, c_os_lens_mo text,
    is_sv boolean not null default false,
    is_bifocal boolean not null default false,
    is_blended_bifocal boolean not null default false,
    is_progressive boolean not null default false,
    is_plastic boolean not null default false,
    is_poly boolean not null default false,
    is_poly_aspheric boolean not null default false,
    is_high_index_167 boolean not null default false,
    is_ultra_hi_index_174 boolean not null default false,
    is_sc_uv_ar boolean not null default false,
    is_blue_shield boolean not null default false,
    is_transition boolean not null default false,
    is_dry_eye_drop boolean not null default false,
    prescribed_by text,
    prescribed_on timestamptz not null default now()
);

-- Stamp who created an intake form and keep those fields fixed on edit.
create or replace function public.intake_forms_stamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        new.created_by_user_id := auth.uid();
        new.created_by := (select display_name from public.profiles where id = auth.uid());
        new.created_on := now();
    else
        new.created_by_user_id := old.created_by_user_id;
        new.created_by := old.created_by;
        new.created_on := old.created_on;
    end if;
    return new;
end;
$$;

create trigger intake_forms_stamp
before insert or update on public.intake_forms
for each row execute function public.intake_forms_stamp();

-- Stamp who saved a refraction and when (last save wins, as before).
create or replace function public.prescriptions_stamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.prescribed_by := (select display_name from public.profiles where id = auth.uid());
    new.prescribed_on := now();
    return new;
end;
$$;

create trigger prescriptions_stamp
before insert or update on public.prescriptions
for each row execute function public.prescriptions_stamp();

-- List rows for the intake form page (with the refraction author).
create or replace view public.intake_form_list
with (security_invoker = true)
as
select
    i.id,
    i.account_id,
    i.full_name,
    i.created_by,
    i.created_by_user_id,
    i.created_on,
    p.prescribed_by,
    i.account_id::text as account_id_text
from public.intake_forms i
left join public.prescriptions p on p.intake_form_id = i.id;

------------------------------------------------------------------------------
-- Referral source report (aggregates only, available to every signed-in user)
------------------------------------------------------------------------------

create or replace function public.referral_counts(
    period_start timestamptz,
    period_end timestamptz,
    time_zone text default 'America/Chicago'
)
returns table (month int, referral_source_id bigint, total bigint)
language sql
stable
security definer
set search_path = public
as $$
    select extract(month from (i.created_on at time zone time_zone))::int,
           i.referral_source_id,
           count(*)
    from public.intake_forms i
    where public.is_active_user()
      and i.created_on >= period_start
      and i.created_on < period_end
    group by 1, 2;
$$;

create or replace function public.referral_months(time_zone text default 'America/Chicago')
returns table (year int, month int)
language sql
stable
security definer
set search_path = public
as $$
    select distinct
           extract(year from (created_on at time zone time_zone))::int,
           extract(month from (created_on at time zone time_zone))::int
    from public.intake_forms
    where public.is_active_user()
    order by 1 desc, 2 desc;
$$;

------------------------------------------------------------------------------
-- Price estimator configuration (single row, id = 1)
------------------------------------------------------------------------------

create table public.optical_store_config (
    id int primary key default 1 check (id = 1),
    eye_exam_price numeric(10, 2) not null check (eye_exam_price >= 0),
    exam_discount_with_complete_glasses numeric(10, 2) not null check (exam_discount_with_complete_glasses >= 0),
    outside_prescription_discount numeric(10, 2) not null check (outside_prescription_discount >= 0),
    lens_discount_without_insurance numeric(10, 2) not null check (lens_discount_without_insurance >= 0),
    pof_charge numeric(10, 2) not null check (pof_charge >= 0),
    -- [10, 20, 30]
    frame_discount_options jsonb not null default '[]',
    -- [{"name": "...", "charge": 0}]
    lens_option_charges jsonb not null default '[]',
    -- [{"name": "...", "price": 0}]
    lens_prices jsonb not null default '[]',
    lens_protection_coatings jsonb not null default '[]',
    lens_transition_options jsonb not null default '[]',
    updated_at timestamptz not null default now()
);

insert into public.optical_store_config (
    id, eye_exam_price, exam_discount_with_complete_glasses, outside_prescription_discount,
    lens_discount_without_insurance, pof_charge,
    frame_discount_options, lens_option_charges, lens_prices,
    lens_protection_coatings, lens_transition_options
) values (
    1, 95.00, 85.00, 45.00, 100.00, 40.00,
    '[10, 20, 30]',
    '[
        {"name": "Regular", "charge": 0.00},
        {"name": "Rimless", "charge": 49.99},
        {"name": "Extra large frame", "charge": 39.99},
        {"name": "Safety lens", "charge": 49.99},
        {"name": "Curve lens (frame)", "charge": 39.99}
    ]',
    '[
        {"name": "Single Vision - CR39 Plastic", "price": 219.99},
        {"name": "Single Vision - Poly HD", "price": 249.99},
        {"name": "Single Vision - Poly Plus Aspheric HD", "price": 269.99},
        {"name": "Single Vision - Hi Index Ultra HD 1.67", "price": 319.99},
        {"name": "Single Vision - Hi Index Ultra HD 1.74 Without Cyl", "price": 369.99},
        {"name": "Single Vision - Hi Index Ultra HD 1.74 With Cyl", "price": 469.99},
        {"name": "Bifocal With Line - CR39 Plastic", "price": 339.99},
        {"name": "Bifocal With Line - Poly HD", "price": 359.99},
        {"name": "Bifocal With Line - Poly Plus Aspheric HD", "price": 379.99},
        {"name": "Bifocal With Line - Hi Index Ultra HD 1.67", "price": 419.99},
        {"name": "Bifocal With Line - Hi Index Ultra HD 1.74 Without Cyl", "price": 469.99},
        {"name": "Bifocal With Line - Hi Index Ultra HD 1.74 With Cyl", "price": 539.99},
        {"name": "Blended Bifocal No Line - CR39 Plastic", "price": 389.99},
        {"name": "Blended Bifocal No Line - Poly HD", "price": 409.99},
        {"name": "Blended Bifocal No Line - Poly Plus Aspheric HD", "price": 429.99},
        {"name": "Blended Bifocal No Line - Hi Index Ultra HD 1.67", "price": 469.99},
        {"name": "Blended Bifocal No Line - Hi Index Ultra HD 1.74 Without Cyl", "price": 519.99},
        {"name": "Blended Bifocal No Line - Hi Index Ultra HD 1.74 With Cyl", "price": 589.99},
        {"name": "Standard Progressive No Line - CR39 Plastic", "price": 359.99},
        {"name": "Standard Progressive No Line - Poly HD", "price": 379.99},
        {"name": "Standard Progressive No Line - Poly Plus Aspheric HD", "price": 399.99},
        {"name": "Standard Progressive No Line - Hi Index Ultra HD 1.67", "price": 439.99},
        {"name": "Standard Progressive No Line - Hi Index Ultra HD 1.74 Without Cyl", "price": 489.99},
        {"name": "Standard Progressive No Line - Hi Index Ultra HD 1.74 With Cyl", "price": 589.99},
        {"name": "Advanced Progressive No Line - Optimized Add-on", "price": 49.99},
        {"name": "Advanced Progressive No Line - Customized Add-on", "price": 59.99},
        {"name": "Advanced Progressive No Line - Personalized Add-on", "price": 69.99}
    ]',
    '[
        {"name": "SV - UV/AR/Anti-Scratch", "price": 79.99},
        {"name": "BF/P - UV/AR/Anti-Scratch", "price": 89.99},
        {"name": "SV - Blue Shield + UV/AR/Anti-Scratch", "price": 109.99},
        {"name": "BF/P - Blue Shield + UV/AR/Anti-Scratch", "price": 149.99}
    ]',
    '[
        {"name": "Regular (Gray/Brown)", "price": 129.99},
        {"name": "Regular (Blue/Green - only for progressive)", "price": 129.99},
        {"name": "Extra Dark (Gray for progressive only)", "price": 169.99},
        {"name": "Polorized Gray/Brown", "price": 129.99},
        {"name": "Blue/Green", "price": 149.99},
        {"name": "Solid Color", "price": 89.99},
        {"name": "Gradiant", "price": 99.99}
    ]'
);

------------------------------------------------------------------------------
-- Row level security
------------------------------------------------------------------------------

alter table public.permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.user_permissions enable row level security;
alter table public.referral_sources enable row level security;
alter table public.checklist_items enable row level security;
alter table public.intake_forms enable row level security;
alter table public.prescriptions enable row level security;
alter table public.optical_store_config enable row level security;

-- Lookups: readable by any active user. Changes are made in the Supabase dashboard.
create policy "active users read permissions" on public.permissions
    for select to authenticated using (public.is_active_user());
create policy "active users read referral sources" on public.referral_sources
    for select to authenticated using (public.is_active_user());
create policy "active users read checklist" on public.checklist_items
    for select to authenticated using (public.is_active_user());

-- Profiles: everyone reads their own; user managers read all.
-- All writes go through the admin-users Edge Function (service role).
create policy "read own profile" on public.profiles
    for select to authenticated using (id = auth.uid());
create policy "user managers read profiles" on public.profiles
    for select to authenticated using (public.has_permission('users'));
create policy "read own permissions" on public.user_permissions
    for select to authenticated using (user_id = auth.uid());
create policy "user managers read user permissions" on public.user_permissions
    for select to authenticated using (public.has_permission('users'));

-- Intake forms.
create policy "read intake forms" on public.intake_forms
    for select to authenticated
    using (public.has_permission('intake_form') or public.has_permission('provide_prescription'));
create policy "create intake forms" on public.intake_forms
    for insert to authenticated
    with check (public.has_permission('intake_form'));
create policy "edit own intake forms" on public.intake_forms
    for update to authenticated
    using (public.has_permission('intake_form') and created_by_user_id = auth.uid())
    with check (public.has_permission('intake_form') and created_by_user_id = auth.uid());

-- Refractions.
create policy "read prescriptions" on public.prescriptions
    for select to authenticated
    using (public.has_permission('intake_form') or public.has_permission('provide_prescription'));
create policy "create prescriptions" on public.prescriptions
    for insert to authenticated
    with check (public.has_permission('provide_prescription'));
create policy "update prescriptions" on public.prescriptions
    for update to authenticated
    using (public.has_permission('provide_prescription'))
    with check (public.has_permission('provide_prescription'));

-- Estimator configuration.
create policy "active users read config" on public.optical_store_config
    for select to authenticated using (public.is_active_user());
create policy "config managers update config" on public.optical_store_config
    for update to authenticated
    using (public.has_permission('optical_store_config'))
    with check (public.has_permission('optical_store_config'));

grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.my_permissions() to authenticated;
grant execute on function public.referral_counts(timestamptz, timestamptz, text) to authenticated;
grant execute on function public.referral_months(text) to authenticated;
revoke execute on function public.referral_counts(timestamptz, timestamptz, text) from anon;
revoke execute on function public.referral_months(text) from anon;
revoke execute on function public.my_permissions() from anon;
