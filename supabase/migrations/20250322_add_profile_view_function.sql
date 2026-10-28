-- Drop existing function if it exists
drop function if exists public.get_profile_view_count;

-- Create view count function
create or replace function public.get_profile_view_count(educator_id uuid)
returns table (
    total_views bigint,
    unique_views bigint,
    last_24h_views bigint
) 
language plpgsql
security definer
set search_path = public
as $$
begin
    return query
    select 
        count(*)::bigint as total_views,
        count(distinct coalesce(viewer_id::text, ip_address))::bigint as unique_views,
        count(*) filter (where viewed_at > now() - interval '24 hours')::bigint as last_24h_views
    from public.profile_views
    where educator_profile_id = educator_id;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_profile_view_count(uuid) to authenticated;

-- Create RLS policy for profile_views table
drop policy if exists "Educators can view their own profile views" on profile_views;
create policy "Educators can view their own profile views"
    on profile_views for select
    using (
        auth.uid() in (
            select user_id 
            from educator_profiles 
            where educator_profiles.id = profile_views.educator_profile_id
        )
    );

-- Create policy for inserting views
drop policy if exists "Anyone can insert profile views" on profile_views;
create policy "Anyone can insert profile views"
    on profile_views for insert
    with check (true);

-- Enable RLS
alter table profile_views enable row level security;
