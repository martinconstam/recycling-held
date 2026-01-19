-- Create profiles table
create table profiles (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  avatar_index integer not null,
  total_points integer default 0,
  level integer default 1,
  quiz_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint username_length check (char_length(username) >= 3)
);

-- Create player_stats table
create table player_stats (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  quiz_score integer default 0,
  process_points integer default 0,
  cards_explored integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table player_stats enable row level security;

-- Create policies to allow public access (for this demo game)
-- In a real app, you would use authenticated policies
create policy "Allow public read access to profiles"
on profiles for select using (true);

create policy "Allow public insert access to profiles"
on profiles for insert with check (true);

create policy "Allow public update access to profiles"
on profiles for update using (true);

create policy "Allow public read access to player_stats"
on player_stats for select using (true);

create policy "Allow public insert access to player_stats"
on player_stats for insert with check (true);

create policy "Allow public update access to player_stats"
on player_stats for update using (true);
