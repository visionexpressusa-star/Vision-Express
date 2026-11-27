-- Dashboard numbers, richer intake list, and inventory tracking.

------------------------------------------------------------------------------
-- Intake list: date of birth, refraction status and date (new columns go last)
------------------------------------------------------------------------------

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
    i.account_id::text as account_id_text,
    i.date_of_birth,
    (p.id is not null) as has_refraction,
    p.prescribed_on,
    i.has_insurance,
    i.insurance_name,
    rs.name as referral_source
from public.intake_forms i
left join public.prescriptions p on p.intake_form_id = i.id
left join public.referral_sources rs on rs.id = i.referral_source_id;

------------------------------------------------------------------------------
-- Inventory
------------------------------------------------------------------------------

create table public.inventory_items (
    id bigint generated always as identity primary key,
    category text not null default 'Frame'
        check (category in ('Frame', 'Sunglasses', 'Lens', 'Contact Lens', 'Accessory', 'Other')),
    brand text not null,
    model text,
    color text,
    size text,
    sku text unique,
    quantity int not null default 0 check (quantity >= 0),
    low_stock_at int not null default 2 check (low_stock_at >= 0),
    cost numeric(10, 2) check (cost >= 0),
    price numeric(10, 2) check (price >= 0),
    location text,
    notes text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    updated_by text
);

create index inventory_items_category_idx on public.inventory_items (category);

-- Every stock change, with who and why.
create table public.inventory_adjustments (
    id bigint generated always as identity primary key,
    item_id bigint not null references public.inventory_items (id) on delete cascade,
    change int not null check (change <> 0),
    quantity_after int not null,
    reason text not null,
    adjusted_by text,
    adjusted_by_user_id uuid references public.profiles (id),
    adjusted_at timestamptz not null default now()
);

create index inventory_adjustments_item_idx on public.inventory_adjustments (item_id, adjusted_at desc);

-- Stamp the editor; quantity only changes through adjust_inventory (or on insert).
create or replace function public.inventory_items_stamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at := now();
    new.updated_by := (select display_name from public.profiles where id = auth.uid());
    if tg_op = 'UPDATE' and current_setting('ve.inventory_adjusting', true) is distinct from 'on' then
        new.quantity := old.quantity;
    end if;
    return new;
end;
$$;

create trigger inventory_items_stamp
before insert or update on public.inventory_items
for each row execute function public.inventory_items_stamp();

-- Record the opening stock of a new item.
create or replace function public.inventory_items_opening_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.quantity <> 0 then
        insert into public.inventory_adjustments (item_id, change, quantity_after, reason, adjusted_by, adjusted_by_user_id)
        values (new.id, new.quantity, new.quantity, 'Opening stock', new.updated_by, auth.uid());
    end if;
    return new;
end;
$$;

create trigger inventory_items_opening_stock
after insert on public.inventory_items
for each row execute function public.inventory_items_opening_stock();

-- Change stock by a signed amount and log it, in one step.
create or replace function public.adjust_inventory(item_id bigint, change int, reason text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
    new_quantity int;
begin
    if not public.has_permission('inventory_check') then
        raise exception 'You do not have permission to adjust inventory.' using errcode = '42501';
    end if;
    if change = 0 then
        raise exception 'Change must not be zero.';
    end if;
    if coalesce(trim(reason), '') = '' then
        raise exception 'A reason is required.';
    end if;

    perform set_config('ve.inventory_adjusting', 'on', true);
    update public.inventory_items i
       set quantity = i.quantity + adjust_inventory.change
     where i.id = adjust_inventory.item_id
    returning i.quantity into new_quantity;
    perform set_config('ve.inventory_adjusting', 'off', true);

    if new_quantity is null then
        raise exception 'Item was not found.';
    end if;

    insert into public.inventory_adjustments (item_id, change, quantity_after, reason, adjusted_by, adjusted_by_user_id)
    values (adjust_inventory.item_id, adjust_inventory.change, new_quantity, trim(reason),
            (select display_name from public.profiles where id = auth.uid()), auth.uid());
    return new_quantity;
exception
    when check_violation then
        raise exception 'Stock cannot go below zero.';
end;
$$;

alter table public.inventory_items enable row level security;
alter table public.inventory_adjustments enable row level security;

create policy "inventory staff read items" on public.inventory_items
    for select to authenticated using (public.has_permission('inventory_check'));
create policy "inventory staff add items" on public.inventory_items
    for insert to authenticated with check (public.has_permission('inventory_check'));
create policy "inventory staff edit items" on public.inventory_items
    for update to authenticated
    using (public.has_permission('inventory_check'))
    with check (public.has_permission('inventory_check'));
create policy "inventory staff read adjustments" on public.inventory_adjustments
    for select to authenticated using (public.has_permission('inventory_check'));

grant select, insert, update on public.inventory_items to authenticated;
grant select on public.inventory_adjustments to authenticated;
grant usage on all sequences in schema public to authenticated;
grant select, insert, update, delete on public.inventory_items, public.inventory_adjustments to service_role;
grant select on public.intake_form_list to authenticated;

------------------------------------------------------------------------------
-- Dashboard numbers (counts only; inventory figures only for inventory staff)
------------------------------------------------------------------------------

create or replace function public.dashboard_stats(time_zone text default 'America/Chicago')
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    today_start timestamptz := date_trunc('day', now() at time zone time_zone) at time zone time_zone;
    week_start timestamptz := date_trunc('week', now() at time zone time_zone) at time zone time_zone;
    month_start timestamptz := date_trunc('month', now() at time zone time_zone) at time zone time_zone;
    result jsonb;
begin
    if not public.is_active_user() then
        return null;
    end if;

    select jsonb_build_object(
        'intake_today', (select count(*) from intake_forms where created_on >= today_start),
        'intake_week', (select count(*) from intake_forms where created_on >= week_start),
        'intake_month', (select count(*) from intake_forms where created_on >= month_start),
        'waiting_refraction', (
            select count(*) from intake_forms i
            where not exists (select 1 from prescriptions p where p.intake_form_id = i.id)),
        'refractions_today', (select count(*) from prescriptions where prescribed_on >= today_start),
        'top_referral_month', (
            select jsonb_build_object('name', rs.name, 'count', count(*))
            from intake_forms i join referral_sources rs on rs.id = i.referral_source_id
            where i.created_on >= month_start
            group by rs.name order by count(*) desc, rs.name limit 1),
        'daily_intake', (
            select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'count', d.count) order by d.day), '[]'::jsonb)
            from (
                select g.day::date as day,
                       (select count(*) from intake_forms i
                         where (i.created_on at time zone time_zone)::date = g.day::date) as count
                from generate_series((now() at time zone time_zone)::date - 13,
                                     (now() at time zone time_zone)::date, interval '1 day') as g(day)
            ) d),
        'low_stock', case when public.has_permission('inventory_check') then (
            select count(*) from inventory_items where active and quantity <= low_stock_at) end,
        'inventory_units', case when public.has_permission('inventory_check') then (
            select coalesce(sum(quantity), 0) from inventory_items where active) end
    ) into result;
    return result;
end;
$$;

------------------------------------------------------------------------------
-- Function access: signed-in users only; trigger functions not callable at all
------------------------------------------------------------------------------

revoke execute on function public.dashboard_stats(text) from public, anon;
revoke execute on function public.adjust_inventory(bigint, int, text) from public, anon;
revoke execute on function public.inventory_items_stamp() from public, anon, authenticated;
revoke execute on function public.inventory_items_opening_stock() from public, anon, authenticated;
grant execute on function public.dashboard_stats(text) to authenticated;
grant execute on function public.adjust_inventory(bigint, int, text) to authenticated;
