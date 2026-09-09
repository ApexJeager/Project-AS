-- Apply this migration in the Supabase SQL editor before starting the server.
-- The Express server uses SUPABASE_SERVICE_ROLE_KEY and therefore bypasses RLS.

create table if not exists public.users (
  id text primary key,
  name text not null,
  role text not null,
  color_group text,
  pin_code text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.children (
  id text primary key,
  first_name text not null,
  last_name text not null,
  color_group text not null,
  status text not null default 'Recruit',
  qualification_progress jsonb not null default '{"consecutive_weeks":0,"recited_astronaut_verse":false,"recited_motto":false,"recited_nt_books":false}'::jsonb,
  current_rank text not null default 'Recruit',
  total_accumulated_points integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_gradings (
  id text primary key,
  child_id text not null references public.children(id) on delete cascade,
  date text not null,
  recorded_by text not null,
  presence boolean not null default false,
  punctuality boolean not null default false,
  good_behavior boolean not null default false,
  verse_of_the_day boolean not null default false,
  bible boolean not null default false,
  cleanliness boolean not null default false,
  scarf boolean not null default false,
  visitors_count integer not null default 0,
  total_day_points integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.attendances (
  id text primary key,
  child_id text not null references public.children(id) on delete cascade,
  date text not null,
  status text not null,
  recorded_by_user_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_reports (
  id text primary key,
  color_group text not null,
  month_year text not null,
  content text not null default '',
  status text not null default 'Draft',
  updated_at timestamptz not null default now()
);

create unique index if not exists daily_gradings_child_date_idx
  on public.daily_gradings (child_id, date);
create unique index if not exists attendances_child_date_idx
  on public.attendances (child_id, date);

alter table public.users enable row level security;
alter table public.children enable row level security;
alter table public.daily_gradings enable row level security;
alter table public.attendances enable row level security;
alter table public.monthly_reports enable row level security;

-- Keep the REST tables closed to browser/anon access. The service role used by
-- the Express server bypasses RLS, while no service key is shipped to Vite.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['users', 'children', 'daily_gradings', 'attendances', 'monthly_reports']
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'server service role access'
    ) then
      execute format(
        'create policy "server service role access" on public.%I for all to service_role using (true) with check (true)',
        table_name
      );
    end if;
  end loop;
end $$;
