
-- camp managers
create table public.camp_managers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  assigned_camp text,
  created_at timestamptz not null default now()
);

-- volunteer / donor accounts awaiting approval
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('volunteer','donor')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.disaster_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  created_at timestamptz not null default now()
);

create table public.camps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  capacity int not null default 0,
  current_occupancy int not null default 0,
  disaster_type text,
  manager_id uuid references public.camp_managers(id) on delete set null,
  status text not null default 'active' check (status in ('active','closed','full')),
  created_at timestamptz not null default now()
);

create table public.supplies (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid references public.camps(id) on delete cascade,
  item_name text not null,
  category text not null default 'general',
  quantity int not null default 0,
  unit text not null default 'units',
  threshold int not null default 10,
  updated_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  target_audience text not null default 'all',
  created_at timestamptz not null default now()
);

create table public.distributions (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid references public.camps(id) on delete cascade,
  item_name text not null,
  quantity int not null default 0,
  recipient text,
  notes text,
  distributed_at timestamptz not null default now()
);

-- Enable RLS and allow anon access (single hardcoded admin login model)
alter table public.camp_managers enable row level security;
alter table public.accounts enable row level security;
alter table public.disaster_types enable row level security;
alter table public.camps enable row level security;
alter table public.supplies enable row level security;
alter table public.alerts enable row level security;
alter table public.distributions enable row level security;

do $$
declare t text;
begin
  for t in select unnest(array['camp_managers','accounts','disaster_types','camps','supplies','alerts','distributions'])
  loop
    execute format('create policy "open_all_%s" on public.%I for all using (true) with check (true);', t, t);
  end loop;
end $$;
