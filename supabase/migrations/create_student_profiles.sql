-- Create student_profiles table if it doesn't exist
create table if not exists public.student_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.student_profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.student_profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.student_profiles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own profile"
  on public.student_profiles for update
  using ( auth.uid() = user_id );

-- Create indexes
create unique index student_profiles_user_id_idx on public.student_profiles(user_id);
create index student_profiles_email_idx on public.student_profiles(email);
