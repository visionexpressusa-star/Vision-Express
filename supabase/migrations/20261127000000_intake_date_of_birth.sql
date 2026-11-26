-- Patient date of birth on intake forms.
-- Nullable so older forms stay valid; the app requires it on new and edited forms
-- and also rejects future dates.
alter table public.intake_forms
    add column date_of_birth date
    check (date_of_birth >= date '1900-01-01');
