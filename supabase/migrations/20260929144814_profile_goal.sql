-- LIVV profile customization: member goal.
alter table public.profiles add column if not exists goal text not null default '';
