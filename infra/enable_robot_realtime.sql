-- Enable Supabase Realtime for live robot position updates.
-- Run this in the Supabase SQL editor after the robots table exists.

alter table public.robots replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'robots'
  ) then
    alter publication supabase_realtime add table public.robots;
  end if;
end $$;

alter table public.robots enable row level security;

drop policy if exists "Authenticated users can read robots" on public.robots;

create policy "Authenticated users can read robots"
on public.robots
for select
to authenticated
using (true);
