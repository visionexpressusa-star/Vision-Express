-- Run once in the Supabase SQL editor AFTER creating the Auth user for the first admin
-- (Authentication > Users > Add user > Create new user):
--   e-mail:   rsayani@ve-internal.local     (username + "@ve-internal.local", lower case)
--   password: choose one
--   tick "Auto Confirm User"
-- Change the username / display name below if you used a different one.

insert into public.profiles (id, username, display_name, role, active)
select id, 'rsayani', 'Rehman Sayani', 'ADMIN', true
from auth.users
where email = 'rsayani@ve-internal.local'
on conflict (id) do update set role = 'ADMIN', active = true;
