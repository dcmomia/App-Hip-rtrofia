-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USER STATE (Existing)
create table if not exists public.user_state (
  user_id uuid references auth.users not null primary key,
  meso_cycle int not null default 1,
  week int not null default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_state enable row level security;

create policy "Users can view their own state" on public.user_state for select using (auth.uid() = user_id);
create policy "Users can manage own state" on public.user_state for all using (auth.uid() = user_id);

-- 2. ENUMS & CONSTANTS
do $$ begin
    create type public.muscle_group_enum as enum (
        'Chest', 'Back', 'Quads', 'Hamstrings', 'Glutes', 
        'Delts_Front', 'Delts_Side', 'Delts_Rear', 
        'Biceps', 'Triceps', 'Calves', 'Abs', 'Traps', 'Forearms'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.exercise_tier as enum ('S', 'A', 'B', 'C', 'F');
exception
    when duplicate_object then null;
end $$;

-- 3. EXERCISES
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references auth.users, -- Null = System/Global
  name text not null,
  muscle_group muscle_group_enum not null,
  tier exercise_tier default 'B',
  equipment text, -- 'Barbell', 'Dumbbell', 'Cable', 'Machine'
  video_url text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exercises enable row level security;

-- Policies for Exercises
create policy "Read public exercises" on public.exercises for select using (is_public = true or created_by = auth.uid());
create policy "Users can manage own exercises" on public.exercises for all using (auth.uid() = created_by);

-- 4. VOLUME LANDMARKS (Benchmarks)
create table if not exists public.volume_landmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  muscle_group muscle_group_enum not null,
  mev int default 10, -- Minimum Effective Volume
  mav_min int default 12,
  mav_max int default 20,
  mrv int default 22, -- Maximum Recoverable Volume
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, muscle_group)
);

alter table public.volume_landmarks enable row level security;

create policy "Users can manage own landmarks" on public.volume_landmarks for all using (auth.uid() = user_id);

-- 5. MESOCYCLES
create table if not exists public.mesocycles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text default 'Hypertrophy Block',
  start_date date not null default current_date,
  end_date date,
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.mesocycles enable row level security;
create policy "Users can manage own mesocycles" on public.mesocycles for all using (auth.uid() = user_id);

-- 6. SESSIONS (Workouts)
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mesocycle_id uuid references public.mesocycles(id),
  date date not null default current_date,
  week_number int not null,
  day_name text, -- e.g., 'Legs Hypertrophy'
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  fatigue_rating int, -- 1-10
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sessions enable row level security;
create policy "Users can manage own sessions" on public.sessions for all using (auth.uid() = user_id);

-- 7. SETS
create table if not exists public.sets (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) not null,
  set_order int not null,
  weight_kg numeric(6,2),
  reps int,
  rir numeric(3,1), -- Reps In Reserve
  rpe numeric(3,1), -- Rate of Perceived Exertion
  is_warmup boolean default false,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sets enable row level security;
create policy "Users can manage own sets" on public.sets 
  for all 
  using (auth.uid() = (select user_id from public.sessions where id = session_id));

-- HELPER VIEW for Volume Analytics
create or replace view public.weekly_volume_stats as
select 
  s.user_id,
  sess.week_number,
  e.muscle_group,
  count(*) filter (where not is_warmup and (rir <= 4 or rir is null)) as effective_sets
from public.sets s
join public.sessions sess on s.session_id = sess.id
join public.exercises e on s.exercise_id = e.id
group by s.user_id, sess.week_number, e.muscle_group;
