-- Create a table to store user state (meso/week progress)
create table if not exists public.user_state (
  user_id uuid references auth.users not null primary key,
  meso_cycle int not null default 1,
  week int not null default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.user_state enable row level security;

create policy "Users can view their own state"
  on public.user_state for select
  using (auth.uid() = user_id);

create policy "Users can insert their own state"
  on public.user_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own state"
  on public.user_state for update
  using (auth.uid() = user_id);
